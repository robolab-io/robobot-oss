const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { devAPI } = require("robo-bot-utils");
const xpBot = require("../utils/xpBot");
const xpRequirement = { xp: 10 };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View someone's MechaKeys keystrokes")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person you want to view")
        .setRequired(false)
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

    let userArgument = interaction.options.getUser("user");
    let user;

    if (userArgument) {
      user = userArgument.id;
    } else {
      user = interaction.user.id;
    }

    let query;
    const discordIdData = await devAPI.getUserByDiscordID(user);
    query = discordIdData.data.username;

    if (!discordIdData || !discordIdData.success) {
      let doesntExistEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(
          `<a:red_siren:812813923522183208> <@${user}> needs to link their account to view keystrokes!`
        );
      return interaction.editReply({ embeds: [doesntExistEmbed] });
    }

    const mechakeysUserData = await devAPI.getUser(query);

    let profileEmbed = new EmbedBuilder()
      .setDescription(
        `**${query}** (<@${user}>) has **${
          mechakeysUserData &&
          mechakeysUserData.data &&
          mechakeysUserData.data.keystrokes &&
          !!Number(mechakeysUserData.data.keystrokes)
            ? mechakeysUserData.data.keystrokes
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : "zero"
        }** keystrokes`
      )
      .setColor("2f3136");

    await interaction.editReply({ embeds: [profileEmbed] });
  },
};
