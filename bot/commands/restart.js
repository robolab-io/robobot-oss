const { SlashCommandBuilder } = require("discord.js");
const { TOKEN } = require("robo-bot-utils")

module.exports = {
  alias: ['restart'],
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart the bot"),

  async execute(interaction) {
    await interaction.reply("Restarting...");
    interaction.client.destroy();
    interaction.client.login(TOKEN);
  }
}