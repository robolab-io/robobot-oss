const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 };
const pyroBar = require("../utils/pyroBar");
const xpBot = require("../utils/xpBot");

const { discordAPI } = require("robo-bot-utils");
const { ch_general } = require('../ids')

module.exports = {
  alias: ['boost'],
  data: new SlashCommandBuilder()
    .setName("boostdevice")
    .setDescription("Hack the channel boost! Requires a Boost Device."),

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
      .setTitle("You don't have a Boost Device!")
      .setDescription("You can /buy one at the store")
      .setColor("ff0000")
      .setImage(
        "https://cdn.discordapp.com/attachments/972239161379680336/1013526204227260436/image.webp"
      );

    let author_discord_object = await discordAPI.getUser(interaction.user.id);
    if (!author_discord_object || !author_discord_object.success) {
      return interaction.editReply(
        `<@${interaction.user.id}>, error grabbing your discord data.`
      );
    }
    author_discord_object = author_discord_object.data;

    if (!author_discord_object.boostDeviceCount) {
      return interaction.editReply({ embeds: [errEmb] });
    }

    const calcWin = () => {
      let chance = Math.random() < 0.98;
      return {
        win: Math.random() < chance,
        chance: Math.round(chance * 100 * 1000) / 1000,
      };
    };

    const winObject = calcWin();
    const win = winObject.win;

    if (win) {
      pyroBar.fillDatBoost(interaction.client, 70, ch_general, 5);

      let deduct_boost = await discordAPI.decrementField(interaction.user.id, {
        field: "boostDeviceCount",
      });

      if (!deduct_boost.success) {
        return interaction.editReply(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, something went wrong when using the Boost Device!`
        );
      }

      const emb = new EmbedBuilder()
        .setTitle("You used a Boost Device!")
        .setDescription(
          `<@${
            interaction.user.id
          }> carefully plugs their Boost Device into Robo-bot's exposed wirings... and **hacks the boost!** \n\n**${pyroBar.getLilBarThingLol(
            interaction.client,
            ch_general,
            5
          )}**`
        )
        .setColor("1eff7a")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/972239161379680336/1013516206713606334/image.webp"
        );

      return interaction.editReply({ embeds: [emb] });
    } else {
      let deduct_boost = await discordAPI.decrementField(interaction.user.id, {
        field: "boostDeviceCount",
      });

      if (!deduct_boost.success) {
        return interaction.editReply(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, something went wrong when using the Boost Device!`
        );
      }

      const emb = new EmbedBuilder()
        .setTitle("You used a Boost Device! But...")
        .setDescription(
          `<@${interaction.user.id}> accidentally trips Robo-bot's antivirus and broke the Boost Device!`
        )
        .setColor("ff0000")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/972239161379680336/1013527956850737233/unknown.png"
        );

      return interaction.editReply({ embeds: [emb] });
    }
  },
};
