const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { devAPI } = require("robo-bot-utils");

const xpBot = require("./../utils/xpBot");

const xpRequirement = { xp: 2000 };

module.exports = {
  alias: ['l'],
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the MechaKeys weekly leaderboard"),

  async execute(interaction) {
    interaction.deferReply();

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

      return interaction.reply({ embeds: [notEnoughXPEmbed], ephemeral: true });
    }

    const leaderboardData = await devAPI.getLeaders();

    let [ranks, users, keystrokes] = [[], [], []];
    leaderboardData.data.leaders.slice(0, 10).forEach((obj, i) => {
      users.push(
        i +
          1 +
          " - " +
          obj.username +
          " - " +
          "**`" +
          obj.keystrokes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
          "`**"
      );
    });

    let leaderboardEmbed = new EmbedBuilder()
      .setTitle(
        `Leaderboard of ${new Date(
          +leaderboardData.data.leaders[0].weekID
        ).toLocaleDateString()}`
      )
      .setDescription(users.join("\n"))
      .setColor("2f3136")
      .setThumbnail(
        "https://mechakeys.robolab.io/discord/media/records/record_multi.gif"
      );

    await interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
