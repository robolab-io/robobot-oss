const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

const { devAPI } = require("robo-bot-utils")

// May need to implement command accumulator, tbd
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlink")
    .setDescription("Request to unlink a MeckaKeys account from Discord.")
    .addUserOption((option) =>
      option
        .setName("MechaKeys Username")
        .setDescription("MechaKeys Username (case sensitive)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("MechaKeys Account Email")
        .setDescription("Accounts associated email to send verification")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply()

    const MK_Username = interaction.options.getString("MechaKeys Username")
    const MK_Account_Email = interaction.options.getString("MechaKeys Account Email")

    let res = await devAPI.unlink(MK_Username, MK_Account_Email)
    console.log(`UNLINK REQUEST\nRequester: ${interaction.user.id}\nMK User:${MK_Username}\nRes: ${res}`)

    let unlinkEmbed = new EmbedBuilder()
      .setDescription(res?.message || 'Unknown error...')
      .setColor("2f3136")

    interaction.editReply({ embeds: [unlinkEmbed] })
  },
};
