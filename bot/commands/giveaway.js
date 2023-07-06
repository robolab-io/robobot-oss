const { SlashCommandBuilder } = require("discord.js");

const createEvent = require("../utils/createEvent");
const pyroBar = require(".././utils/pyroBar");

const { devAPI, discordAPI } = require("robo-bot-utils");
// const commandLimiter = require('./../utils/commandLimiter')
// const hasBannedWord = require('../utils/hasBannedWord')
const commandAccumulator = require("../utils/commandAccumulator");
const parseDuration = require("parse-duration");
const { EmbedBuilder } = require("discord.js");
const wait = require("../utils/wait");
function detect_url(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex);
}
function timeConversion(millisec) {
  let seconds = Math.round(millisec / 1000);
  let minutes = Math.round(millisec / (1000 * 60));
  let hours = Math.round(millisec / (1000 * 60 * 60));
  let days = Math.round(millisec / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return seconds + " seconds";
  } else if (minutes < 60) {
    return minutes + " minutes";
  } else if (hours < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
}

const limitViolation = function (winners, prize, duration, level) {
  if (winners > limits.max_winners || winners < limits.min_winners) {
    return `**Winner count** is out of range.\n**Min:** ${limits.min_winners} **Max:** ${limits.max_winners}`;
  }
  if (duration > limits.max_duration || duration < limits.min_duration) {
    return `**Duration** is out of range.\n**Min:** ${timeConversion(
      limits.min_duration
    )} **Max:** ${timeConversion(limits.max_duration)}`;
  }
  if (level > limits.max_level || level < limits.min_level) {
    return `**Level requirement** is out of range.\n**Min:** Level ${limits.min_level} **Max:** Level ${limits.max_level}`;
  }
  if (prize / winners < limits.min_prize_per_winner) {
    return `Each winner must win **at least** ${limits.min_prize_per_winner} keycaps.`;
  }
  if (prize > limits.max_prize) {
    return `**Prize total** is out of range.\n**Max:** ${limits.max_prize} keycaps`;
  }
  if (prize / limits.min_prize_per_hour < duration / 60 / 60 / 1000) {
    // prize_total/min_prize_per_hour < hours
    return `You need at least ${limits.min_prize_per_hour} TOTAL keycaps per hour.`;
  }
  return false; // success!
};

const limits = {
  lineCount: 3,
  charCount: 200,
  max_winners: 100,
  min_winners: 1,
  min_prize_per_winner: 100,
  max_prize: 500000,
  min_duration: 30000, // 1 hour
  max_duration: 3600000 * 24 * 14, // 14 days
  max_level: 20,
  min_level: 0,
  min_prize_per_hour: 0, // 1200keycaps per day
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Start a keycap giveaway")
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("How many winnners should this giveaway have?")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )

    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("How many keycaps should each winner receive?")
        .setMinValue(100)
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName("length")
        .setDescription("How long should this giveaway run for?")
        .setRequired(true)
    )

    .addIntegerOption((option) =>
      option
        .setName("levelrequirement")
        .setDescription("What level do winners need to be?")
        .setMinValue(0)
        .setMaxValue(20)
        .setRequired(true)
    )

    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Write a message that appears on the giveaway message")
        .setMaxLength(200)
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let author_discord_object = await discordAPI.getUser(interaction.user.id);
    if (!author_discord_object || !author_discord_object.success) {
      return interaction.editReply(
        `<@${interaction.user.id}>, error grabbing your discord data.`
      );
    }

    let winners = interaction.options.getInteger("winners");
    let amountPerWinner = interaction.options.getInteger("amount");
    let lengthOfGiveaway = parseDuration(
      interaction.options.getString("length")
    );
    let levelRequirement = interaction.options.getInteger("levelrequirement");
    const fullString = interaction.options.getString("message");

    const limitRes = limitViolation(
      winners,
      amountPerWinner * winners,
      lengthOfGiveaway,
      levelRequirement
    );

    if (limitRes) {
      let limitEmb = new EmbedBuilder()
        .setTitle("Giveaway Builder")
        .setDescription(`${limitRes}`)
        .setColor("ff4754");
      return interaction.editReply({ embeds: [limitEmb] });
    }

    const out_of_uses = !(await commandAccumulator(
      interaction,
      "giveaway",
      false,
      true
    ));
    if (out_of_uses) return;

    const deductKeycapRes = await devAPI.deductKeycaps(interaction.user.id, {
      amount: `${winners * amountPerWinner}`,
    });
    if (deductKeycapRes && deductKeycapRes.success) {
      // return msg.channel.send(`You bought ${query.toLowerCase()} for \`${store_prices['bodyguards']} keycaps\`! Remember, if you >fight, you lose them and will have to re-buy!`)
    } else {
      return interaction.editReply(
        `<a:red_siren:812813923522183208> You don't have \`${
          winners * amountPerWinner
        } keycaps\` to start that giveaway!`
      );
    }

    const generalChannel =
      interaction.guild.channels.cache.get("462274708499595266"); // general is 462274708499595266
    generalChannel.send(
      `<:giftkeycap:811257704138932234> Psst, <@${interaction.user.id}> just started a giveaway in <#771448471625400351>!`
    );
    pyroBar.fillDatBoost(interaction.client, 20, "462274708499595266", 20);

    const giveawayChannel =
      interaction.guild.channels.cache.get("771448471625400351"); // giveaway: 771448471625400351

    let emb = new EmbedBuilder()
      .setDescription(
        `🧑‍🤝‍🧑 **Winners:** ${winners}
        🏆 **Prize per winner:** <:minikeycap:811257663194660876>${amountPerWinner}
        ⏱️ **Duration:** ${timeConversion(lengthOfGiveaway)}
        <a:robo_roboascend:755944021209120849> **Level Requirement:** ${
          levelRequirement
            ? `Level ${levelRequirement}`
            : "None! (You must still have a linked account.)"
        }

        <@${interaction.user.id}>:
        ${fullString}
        `
      )
      .setAuthor({
        name: `${interaction.user.username} is hosting a giveaway!`,
        iconURL: interaction.user.avatarURL(),
      })
      .setThumbnail(
        "https://mechakeys.robolab.io/discord/media/records/record_multi.gif"
      )
      .setFooter({ text: "React to enter the giveaway!" })
      .setColor("ff3da4");

    const pinger = await giveawayChannel.send("A giveaway has started!");
    pinger.delete();
    const giveawayMsg = await giveawayChannel.send({ embeds: [emb] });

    // giveawayMsg.react(':robo_ascend:842796636174549011')
    giveawayMsg.react(":robo_ppHands:796922161847468043");

    createEvent.giveaway(
      interaction.guild.id,
      interaction.user.id,
      giveawayChannel.id,
      Date.now() + lengthOfGiveaway,
      winners,
      amountPerWinner,
      levelRequirement,
      giveawayMsg.id
    );

    let msgFutureFlavor = [
      `Your ${timeConversion(
        lengthOfGiveaway
      )} giveaway of <:minikeycap:811257663194660876>${
        amountPerWinner * winners
      } has been started in <#771448471625400351>.`,
    ];
    let flavor =
      msgFutureFlavor[Math.floor(Math.random() * msgFutureFlavor.length)];
    return interaction.editReply({
      content: `<@${interaction.user.id}>, ${flavor}`,
    });
  },
};
