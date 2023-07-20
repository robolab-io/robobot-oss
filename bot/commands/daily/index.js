const { SlashCommandBuilder } = require("discord.js")

const { discordAPI } = require("robo-bot-utils");

const { Role_Linked, ch_general, ch_linkChannel, dev_feed } = require('../../ids')

const xpBot = require("../../utils/xpBot");
const pyroBar = require("../../utils/pyroBar");
const keycapAPI = require("../../utils/keycapAPI");
const isBooster = require("../../utils/isBooster");
const createEvent = require("../../server/createEvent");
const { isLinked_discordID } = require("../../utils/isLinked");

const { dailyEmbed, notGeneralChannelEmbFn } = require('./embeds')
const { roundUpToNearestThirty, weightedRandom} = require('./helpers')
const { 
  jackpot_descriptor_map, generateDailyAfterMessage, decide_flavor 
} = require('./flavor')

const lock = {};
const general_channels = [ch_general, dev_feed];

module.exports = {
  alias: ['d'],
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim a daily reward every day"),

  async execute(interaction) {
    await interaction.deferReply();

    if (lock[interaction.user.id]) {
      return interaction.editReply({
        content: "You already claimed a daily reward!",
        ephemeral: true,
      });
    }
    lock[interaction.user.id] = true;

    const guild = interaction.client.guilds.cache.get(interaction.guild.id);
    const userXP = await xpBot.getXP(interaction.user.id);

    const checkLinkedUser = guild.members.cache.get(interaction.user.id);

    if (!checkLinkedUser.roles.cache.get(Role_Linked)) {
      if (await isLinked_discordID(interaction.user.id)) {
        checkLinkedUser.roles.add(Role_Linked);
      } else {
        lock[interaction.user.id] = false;
        return interaction.channel.send(
          `You can't claim a daily reward without linking your account first! Please go to <#${ch_linkChannel}>, then try \`/daily\``
        );
      }
    }

    if (!general_channels.includes(interaction.channel.id)) {
      lock[interaction.user.id] = false;
      let notGeneralChannelEmb = notGeneralChannelEmbFn({interaction})
      return await interaction.editReply({ embeds: [notGeneralChannelEmb] });
    }

    let valid_claimRes = await discordAPI.claimDaily(interaction.user.id);
    if (!valid_claimRes) {
      lock[interaction.user.id] = false;
      return interaction.editReply(
        `<a:red_siren:812813923522183208> Oops, <@${interaction.user.id}>! Something went wrong when claiming your daily reward.`
      );
    }
    const valid_claim = valid_claimRes
    if (!valid_claim.success) {
      lock[interaction.user.id] = false
      const bot_early_response = await interaction.editReply(
        `<a:red_siren:812813923522183208> Oops, <@${interaction.user.id}>! ${
          valid_claim.message || "Something broked!"
        }`
      )
      return
    }

    const jackpot = {
      current: valid_claim.data.jackpot.current,
      winnings: valid_claim.data.jackpot.winnings || 0,
    };
    let jackpot_descriptor = decide_flavor(
      jackpot_descriptor_map,
      jackpot.winnings
    );
    let jackpot_message = "";

    if (jackpot.winnings) {
      jackpot_message += `\n╔═══════🎉═══════╗\n**YOU WON THE JACKPOT!!!** \n ** 🏆 ${
        jackpot.winnings
      }${
        isBooster(interaction.guild, interaction.user.id) ? "(x2)" : ""
      }** keycaps!\n╚═══════🎉═══════╝`;
    } else {
      jackpot_message += `\nYou did not win the jackpot this time.\nCurrent jackpot: **${jackpot.current}** keycaps.`;
    }

    const rewardBase =
      weightedRandom(1, userXP.level || 2) +
      Math.round(weightedRandom(1, userXP.level || 2) / 2) +
      weightedRandom(1, userXP.level || 2);

    const reward = {
      keycaps: {
        amount: rewardBase,
      },
      xp: {
        amount: rewardBase * 10,
      },
    };

    const rewardToGive =
      Object.keys(reward)[
        Math.floor(Math.random() * Object.keys(reward).length)
      ];
    const description = jackpot.winnings
      ? jackpot_message
      : `Nice! You gained \`${reward[rewardToGive].amount}${
          isBooster(interaction.guild, interaction.user.id) ? "(x2)" : ""
        } ${rewardToGive}!\`\nYou did not win the jackpot this time. \n**Current Jackpot:** ${
          jackpot.current
        } keycaps`;

    let emb = dailyEmbed({
      description, interaction, jackpot, jackpot_descriptor, rewardToGive
    })
    interaction.editReply({ embeds: [emb] });

    if ( userXP < 500 ) { // 500xp == level 5. 
      // could add random chance too || (Math.random() > 0.5)
      // could get xp from static/xpLevels.js
      setTimeout(() => {
        interaction.channel.send(
          `<@${interaction.user.id}>: ${generateDailyAfterMessage()}`
        );
      }, 10000);
    }
    
    if (jackpot.winnings) {
      await keycapAPI.awardKeycaps(
        interaction.guild,
        interaction.user.id,
        jackpot.winnings,
        "discordjackpot"
      );
      pyroBar.fillDatBoost(interaction.client, 90, ch_general, 480);
    }
    if (rewardToGive === "keycaps") {
      await keycapAPI.awardKeycaps(
        interaction.guild,
        interaction.user.id,
        reward[rewardToGive].amount,
        "dailydiscord"
      );
    } else if (rewardToGive === "xp") {
      await xpBot.giveXP(
        interaction.user,
        reward[rewardToGive].amount,
        interaction.channel,
        interaction.client
      );
    }
    pyroBar.fillDatBoost(interaction.client, 1, ch_general, 10);
    lock[interaction.user.id] = false;
    await createEvent.directMessageUserInFuture(
      interaction.guild.id,
      interaction.user.id,
      roundUpToNearestThirty(Date.now() + 84600000),
      true,
      false,
      "dailydiscord_reminder"
    );
    return;
  },
};
