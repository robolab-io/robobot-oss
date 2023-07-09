const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const { devAPI } = require("robo-bot-utils");

module.exports = {
  alias: ['give'],
  data: new SlashCommandBuilder()
    .setName("gift")
    .setDescription("Developer-only - Gift keycaps to a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to send keycaps to?")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many keycaps should we send?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Why are we sending keycaps to this user?")
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const member = interaction.options.getUser("user");
    const mention = `<@!${member.id}>`;
    const keycapAmount = interaction.options.getInteger("amount");
    const reason = interaction.options.getString("reason") ?? "gift";

    await devAPI.giveKeycaps(member.id, {
      amount: keycapAmount,
      reason: reason,
    });
    let awardEmb = new EmbedBuilder()
      .setDescription(`${mention} was awarded **${keycapAmount} keycaps**!`)
      .setColor("2f3136");

    interaction.editReply({ embeds: [awardEmb] });
  },
};
