/* eslint-disable no-mixed-spaces-and-tabs */
const { SlashCommandBuilder } = require("discord.js")
const { EmbedBuilder } = require("discord.js")

const { devAPI } = require("robo-bot-utils")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deduct")
    .setDescription("Developer-only - Remove keycaps from a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to remove keycaps from?")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many keycaps should we remove?")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const member = interaction.options.getUser("user")
    const mention = `<@!${member.id}>`
    const keycapAmount = interaction.options.getInteger("amount")

    await devAPI.deductKeycaps(member.id, { amount: keycapAmount })
    let awardEmb = new EmbedBuilder()
      .setDescription(`Removed **${keycapAmount} keycaps** from ${mention}.`)
      .setColor("2f3136")

    interaction.editReply({ embeds: [awardEmb] })
  },
};
