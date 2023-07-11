const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const createEvent = require("../utils/createEvent");
const events = require("../utils/events");

const { discordAPI } = require("robo-bot-utils");

function timeConversion(millisec) {
  let seconds = Math.round(millisec / 1000);
  let minutes = Math.round(millisec / (1000 * 60));
  let hours = Math.round(millisec / (1000 * 60 * 60));
  let days = Math.round(millisec / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return seconds + " seconds";
  } else if (minutes < 60) {
    return minutes + " minutes";
  } else if (hours < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
}

module.exports = {
  alias: ['messagefuture'],
  data: new SlashCommandBuilder()
    .setName("glowingpencil")
    .setDescription("Send a message to the future! Requires a Glowing Pencil.")
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("When should this message be sent, in hours?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What should we send to the future?")
        .setRequired(true)
        .setMaxLength(600)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let hours = interaction.options.getNumber("time");
    let fullString = interaction.options.getString("message");

    const errEmb = new EmbedBuilder()
      .setTitle("You don't have a Glowing Pencil!")
      .setDescription("But don't worry, you can /buy one at the store")
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

    if (!author_discord_object.glowingPencilCount) {
      return interaction.editReply({ embeds: [errEmb] });
    }

    let deduct_pencil = await discordAPI.decrementField(interaction.user.id, {
      field: "glowingPencilCount",
    });

    if (!deduct_pencil.success) {
      return interaction.reply(
        `<a:red_siren:812813923522183208> <@${interaction.user.id}>, something went wrong when using the glowing pencil!`
      );
    }

    if (hours <= 0.033) {
      setTimeout(() => {
        events.messageFromThePast(interaction.client, {
          guildID: interaction.guild.id,
          userID: interaction.user.id,
          channelID: interaction.channel.id,
          message: fullString,
          request_time: Date.now() - hours * 60 * 60 * 1000,
        });
      }, hours * 60 * 60 * 1000);
    } else {
      createEvent.messageFromThePast(
        interaction.guild.id,
        interaction.user.id,
        interaction.channel.id,
        fullString,
        hours
      );
    }

    return interaction.editReply({
      content: `<@${
        interaction.user.id
      }>, your message has been sent ${timeConversion(
        hours * 60 * 60 * 1000
      )} to the future!`,
      ephemeral: true,
    });
  },
};
