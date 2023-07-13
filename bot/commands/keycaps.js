const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { devAPI } = require("robo-bot-utils");

const xpBot = require("../utils/xpBot");
const { getTargetUser } = require("../utils/getTargetUser");

const xpRequirement = { xp: 10 };



let fn = (options={ephemeral:false}) => {
  return async (interaction) => {
    await interaction.deferReply({ephemeral: options.ephemeral});

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

    let userID = getTargetUser(interaction).id

    let query;
    const discordIdData = await devAPI.getUserByDiscordID(userID);
    query = discordIdData.data.username;

    if (!discordIdData || !discordIdData.success) {
      let doesntExistEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(
          `<a:red_siren:812813923522183208> <@${userID}> needs to link their account to view keycap balance!`
        );
      return interaction.editReply({ embeds: [doesntExistEmbed] });
    }

    const mechakeysUserData = await devAPI.getUser(query);

    let profileEmbed = new EmbedBuilder()
      .setDescription(
        `**${query}** (<@${userID}>) has **${
          mechakeysUserData &&
          mechakeysUserData.data &&
          mechakeysUserData.data.coins &&
          !!Number(mechakeysUserData.data.coins)
            ? mechakeysUserData.data.coins
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : "zero"
        }** keycaps.`
      )
      .setColor("2f3136");

    await interaction.editReply({ embeds: [profileEmbed] });
  }
}



module.exports = {
  alias: ['kc'],
  data: new SlashCommandBuilder()
    .setName("keycaps")
    .setDescription("View someone's keycap balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person you want to view")
        .setRequired(false)
    ),
  execute: fn({ ephemeral: false, menu: false }),
  fn
}
