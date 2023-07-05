const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const xpBot = require("./../utils/xpBot");
const xpRequirement = { xp: 2000 };

const { discordAPI } = require("robo-bot-utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View your Discord inventory and items"),

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

      return interaction.reply({ embeds: [notEnoughXPEmbed], ephemeral: true });
    }

    let discordUserData = await discordAPI.getUser(interaction.user.id);
    console.log(discordUserData);
    if (!discordUserData || !discordUserData.success) {
      return interaction.editReply({
        content: `Sorry, <@${interaction.user.id}>, something broked when we tried to get your inventory. Maybe you have nothing?`,
      });
    }
    discordUserData = discordUserData.data;

    let description = "";

    if (discordUserData.pokeballCount || discordUserData.pokeballCount === 0) {
      description += `<:pokeball:816114055143096360> **Pokeball** - ${discordUserData.pokeballCount}\n`;
    }
    if (
      discordUserData.glowingPencilCount ||
      discordUserData.glowingPencilCount === 0
    ) {
      description += `<:glowing_pencil:816114905936953354> **Glowing Pencil** - ${discordUserData.glowingPencilCount}\n`;
    }
    if (
      discordUserData.bitchslapCount ||
      discordUserData.bitchslapCount === 0
    ) {
      description += `:nail_care: **Bitchslap** - ${discordUserData.bitchslapCount}\n`;
    }

    description =
      description ||
      "You open your backpack with a poof of dust, and see nothing but cobwebs and cookie crumbs!";

    let inventoryEmbed = new EmbedBuilder()
      .setDescription(
        `*${interaction.user.username} opens their backpack...*\n` + description
      )
      .setThumbnail(
        "https://mechakeys.robolab.io/discord/media/misc/backpack.png"
      )
      .setColor("2f3136");

    await interaction.editReply({ embeds: [inventoryEmbed] });
  },
};
