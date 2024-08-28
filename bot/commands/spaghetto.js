const { SlashCommandBuilder } = require("discord.js");
const { devAPI } = require("robo-bot-utils");

module.exports = {
  alias: ['spaghetto'],
  data: new SlashCommandBuilder()
    .setName("spaghetto")
    .setDescription("Get a random bad code image from Reddit"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const posts = await devAPI.getRedditPosts('badcode');
      const filteredPosts = posts.filter(p => p.data.url.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/));
      const url = filteredPosts[Math.floor(Math.random() * filteredPosts.length)].data.url;

      interaction.editReply(url);
    } catch (error) {
      console.error(error);
      interaction.editReply("An error occurred while fetching the image.");
    }
  }
}