const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const xpBot = require("./../utils/xpBot");
const pyroBar = require("./../utils/pyroBar");

const commandAccumulator = require("../utils/commandAccumulator");
const { devAPI } = require("robo-bot-utils");
const { ch_general } = require('../ids')

const xpRequirement = { xp: 50 };

const tipThumbs = ["tip1", "tip2", "tip3", "tip4", "tip5"];
const generateTipMessage = (tipper, tippee) => {
  const tipFrom = `<@${tipper}>`;
  const tipTo = `${tippee}`;
  const tipMessages = [
    `With a cool flick of a keycap, ${tipFrom} tipped ${tipTo} 1 keycap!`,
    `${tipFrom} tipped ${tipTo} 1 keycap!`,
    `${tipFrom} threw ${tipTo} a keycap!`,
    `${tipFrom} must like ${tipTo}'s style!`,
    `${tipFrom} gave 1 keycap to ${tipTo}, and ${tipTo} started drooling a bit.`,
    `${tipFrom} tipped 1 keycap to ${tipTo}, and everyone started hooting like apes.`,
    `${tipFrom} flicked a keycap to ${tipTo} and said *"buy yourself somethin' nice, kid."*`,
    `${tipFrom} flicked a keycap to ${tipTo} and said *"keep the change, ya filthy animal."*`,
    `${tipFrom} flicked a keycap to ${tipTo} and I'm pretty sure they fell in love.`,
    `${tipFrom} sent a keycap to ${tipTo}, probably for a good reason!`,
    `Hey ${tipTo}! ${tipFrom} just tipped you 1 keycap!`,
    `Hey ${tipTo}! You just received a tip from ${tipFrom}!`,
    `Hey ${tipTo}! You must be impressing people right now, cause ${tipFrom} just gave you one of his keycaps!`,
    `Hey ${tipTo}! You just got a 1 keycap tip from ${tipFrom}! Great moves. Keep it up.`,
    `${tipTo} just received a shiny keycap from ${tipFrom}!`,
    `With amazing style and a fresh wink, ${tipFrom} flicked a keycap over to ${tipTo} without even looking!`,
    `"Here's my *shiniest* keycap." ${tipFrom} said as he flicked a keycap over to ${tipTo}.`,
    `"There's a lot more where that came from." ${tipFrom} said as he flicked a keycap over to ${tipTo}.`,
    `${tipFrom} reaches into his pocket and frantically takes out pocket lint and a single keycap, and throws it at ${tipTo}.`,
    `${tipFrom} threw a keycap at ${tipTo}'s head!`,
    `${tipFrom} bent over and farted a keycap towards ${tipTo} with impressive propulsion!`,
    `${tipFrom} flicked a very special keycap towards ${tipTo}.`,
    `${tipFrom} did an amazing roundhouse kick to hit a keycap over to ${tipTo}!`,
    `${tipFrom} gave a keycap a wet kiss, and threw it over to ${tipTo}!`,
    `"This keycap has been passed down many generations in my family." ${tipFrom} said as he closed ${tipTo}'s hand over an old, aged keycap.`,
    `"This keycap was inside me at one point." ${tipFrom} said as he placed the yellowed keycap into ${tipTo}'s mouth.`,
    `${tipFrom} opens his mouth to show many, multiple keycaps, all in his mouth and throat! He takes one out, and throws it to ${tipTo}.`,
    `${tipFrom} is LOVIN' ${tipTo} rn, because he just gave him 1 keycap!`,
  ];
  return tipMessages[Math.floor(Math.random() * tipMessages.length)];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tip")
    .setDescription("Give a friend one keycap!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to tip?")
        .setRequired(true)
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

    const out_of_uses = !(await commandAccumulator(
      interaction,
      "tip",
      false,
      true
    ));
    if (out_of_uses) return;

    let userArgument = interaction.options.getUser("user");
    let userID = userArgument.id;

    let query;
    const discordIdData = await devAPI.getUserByDiscordID(userID);
    query = discordIdData.data.username;

    if (!discordIdData || !discordIdData.success) {
      let doesntExistEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(
          `<a:red_siren:812813923522183208> <@${userID}> needs to link their account to be tipped!`
        )
      return interaction.editReply({ embeds: [doesntExistEmbed] });
    }

    const tipper = await devAPI.getXP(interaction.user.id);
    const tipData = await devAPI.tip(tipper.data.username, query);

    if (!tipData || !tipData.success) {
      interaction.editReply(tipData.message || "Something went wrong!");
      return;
    }

    let emb = new EmbedBuilder()
      .setDescription(generateTipMessage(interaction.user.id, userArgument))
      .setAuthor({
        name: interaction.user.username + " tipped!",
        iconURL: interaction.user.avatarURL(),
      })
      .setThumbnail(
        `https://mechakeys.robolab.io/discord/media/tip/${
          tipThumbs[Math.floor(Math.random() * tipThumbs.length)]
        }.gif`
      )
      .setColor("2f3136");

    pyroBar.fillDatBoost(interaction.client, 1, ch_general, 5);

    await interaction.editReply({ embeds: [emb] });
  },
};
