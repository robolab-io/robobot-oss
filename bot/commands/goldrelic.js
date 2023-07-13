const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

const { discordAPI } = require("robo-bot-utils")

const { ch_general } = require('../ids')
const events = require("../server/events")
const xpBot = require("./../utils/xpBot")

const xpRequirement = { xp: 2000, level: 10 }



module.exports = {
  alias: ['superpray'],
  data: new SlashCommandBuilder()
    .setName("goldrelic")
    .setDescription(
      "Pray with higher chances of an event happening! Requires a Gold Relic."
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const currentXP = await xpBot.getXP(interaction.user.id);

    const neededXP = Math.round(xpRequirement.xp - currentXP)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!currentXP || currentXP < xpRequirement.xp) {
      let notEnoughXPEmbed = new EmbedBuilder()
        .setTitle("Not enough XP!")
        .setDescription(
          `<a:red_siren:812813923522183208> You do not have enough XP to perform this action. You need ${neededXP} more XP.`
        )
        .setColor("2f3136");

      return interaction.editReply({
        embeds: [notEnoughXPEmbed],
        ephemeral: true,
      });
    }

    const errEmb = new EmbedBuilder()
      .setTitle("You don't have a Gold Relic!")
      .setDescription("The shopkeeper has some at the `/store`!")
      .setColor("ff0000")
      .setImage(
        "https://cdn.discordapp.com/attachments/972239161379680336/1014359383012020274/unknown.png"
      );

    let author_discord_object = await discordAPI.getUser(interaction.user.id);
    if (!author_discord_object || !author_discord_object.success) {
      return interaction.editReply(
        `<@${interaction.user.id}>, error grabbing your discord data.`
      );
    }

    if (!author_discord_object.data.goldRelicCount) {
      return interaction.editReply({ embeds: [errEmb] });
    }

    const calcWin = () => {
      let chance = Math.random() < 0.65;
      return {
        win: Math.random() < chance,
        chance: Math.round(chance * 100 * 1000) / 1000,
      };
    };

    const winObject = calcWin();
    const win = winObject.win;

    if (win) {
      let deduct_pencil = await discordAPI.decrementField(interaction.user.id, {
        field: "goldRelicCount",
      });
      if (!deduct_pencil.success) {
        return interaction.channel.send(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, something went wrong when using the gold relic!`
        );
      }

      const emb = new EmbedBuilder()
        .setTitle("You used a Gold Relic!")
        .setDescription(
          `<@${interaction.user.id}>, suddenly, your Gold Relic starts glowing! The gods have accepted your gift!`
        )
        .setColor("1eff7a")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/972239161379680336/1014356565916143676/asdf.webp"
        );

      const rewardTypes = ["keycaps", "xp"];
      const eventTypes = [
        "multi_keycapDrop",
        "multi_xpDrop",
        "jackpot_increase",
        "boost_channel",
      ];

      const randomReward = Math.floor(Math.random() * rewardTypes.length);
      const randomEvent = Math.floor(Math.random() * eventTypes.length);

      const eventMappingOverrides = {
        maxTime: 10000,
        reward: { type: "xp", amt: 20 },
        punishment: { type: "role", role: "dead", duration: 120000 },
      };
      events.roboEvent(interaction.client, {
        guildID: interaction.guild.id,
        channelID: ch_general,
        rewardType: `${rewardTypes[randomReward]}`,
        eventType: `${eventTypes[randomEvent]}`,
        eventMappingOverrides,
      });
      return interaction.editReply({ embeds: [emb] });
    } else {
      let deduct_pencil = await discordAPI.decrementField(interaction.user.id, {
        field: "goldRelicCount",
      });
      if (!deduct_pencil.success) {
        return interaction.channel.send(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, something went wrong when using the gold relic!`
        );
      }

      const emb = new EmbedBuilder()
        .setTitle("You used a Gold Relic!")
        .setDescription(
          `<@${interaction.user.id}>, your gold relic fades to dust, but nothing happens! Better luck next time!`
        )
        .setColor("ff0000")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/972239161379680336/1014356565505089536/asdfasdf.webp"
        );

      return interaction.editReply({ embeds: [emb] });
    }
  },
};
