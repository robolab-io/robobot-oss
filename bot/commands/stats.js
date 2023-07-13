const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const xpBot = require("../utils/xpBot");
const xpRequirement = { xp: 10 };

const { discordAPI } = require("robo-bot-utils");
const { getTargetUser } = require("../utils/getTargetUser");



let fn = (options={ ephemeral: false, menu: false }) => {
  return async (interaction) => {
    await interaction.deferReply({ephemeral: options?.ephemeral});

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

    let userID = getTargetUser(interaction, options?.menu).id

    let getData = await discordAPI.getUser(userID);
    let discordUserData = getData.data;

    let formatStats = notableItems
      .filter((x) => discordUserData[Object.keys(x)[0]])
      .map((x) => {
        return `${x[Object.keys(x)[0]].emoji}** \`${
          discordUserData[Object.keys(x)[0]]
        }\`** ${x[Object.keys(x)[0]].name}\n`;
      });

    let noStatsEmbed = new EmbedBuilder()
      .setDescription(
        `**<@${userID}>'s stats** \n\n<@${userID}> doesn't have any stats!`
      )
      .setColor("2f3136");

    if (!formatStats || !formatStats.length) {
      return interaction.editReply({ embeds: [noStatsEmbed] });
    }

    let statsEmbed = new EmbedBuilder()
      .setDescription(`**<@${userID}>'s stats** \n\n${formatStats.join("")}`)
      .setColor("2f3136");

    await interaction.editReply({ embeds: [statsEmbed] });
  }
}



module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View someone's Discord stats")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person you want to view")
        .setRequired(false)
    ),

  execute: fn({ ephemeral: false, menu: false }),
  fn
}



const notableItems = [
  {
    deathCount: {
      name: "Deaths",
      emoji: "💀",
    },
  },
  {
    fightsWon: {
      name: "Fights Won",
      emoji: "🥊",
    },
  },
  {
    fightsLost: {
      name: "Fights Lost",
      emoji: "😵",
    },
  },
  {
    secretPepesFound: {
      name: "Secret Pepes Found",
      emoji: "<:robo_pepeShhh:780486164963786822>",
    },
  },
  {
    tumbleweedsBounced: {
      name: "Tumbleweeds Bounced",
      emoji: "<:tumbleweed:702482059095965706>",
    },
  },
  {
    bombRiddlesSolved: {
      name: "Bomb Riddles Solved",
      emoji: "<:robo_smart:842796764692086784>",
    },
  },
  {
    bombsDefused: {
      name: "Bombs Defused",
      emoji: "😅",
    },
  },
  {
    roboRewardsClaimed: {
      name: "Robo Rewards Claimed",
      emoji: "🤲",
    },
  },
  {
    roboDeathsDodged: {
      name: "Robo Deaths Dodged",
      emoji: "<a:robo_ANGERY:844438418087215114>",
    },
  },
]
