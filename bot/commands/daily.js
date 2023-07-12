const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

const { Role_Linked, ch_general, ch_linkChannel, dev_feed } = require('../ids')

const xpBot = require("../utils/xpBot");
const pyroBar = require("../utils/pyroBar");
const keycapAPI = require("../utils/keycapAPI");
const isBooster = require("../utils/isBooster");
const createEvent = require("../utils/createEvent");
const { isLinked_discordID } = require("../utils/isLinked");
const { discordAPI } = require("robo-bot-utils");
const gifs = {
  keycaps: [
    "https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif",
  ],
  xp: ["https://mechakeys.robolab.io/discord/media/daily/daily_xp_1.gif"],
};

function roundUpToNearestThirty(timestamp) {
  var date = new Date(timestamp);
  date.setMilliseconds(0);
  date.setSeconds(0);
  var minutes = date.getMinutes();
  var remainder = minutes % 30;
  if (remainder !== 0) {
    date.setMinutes(minutes + (30 - remainder));
  } else {
    // If remainder is 0, check if the minutes are already on a half hour
    // eslint-disable-next-line no-lonely-if
    if (minutes !== 0) {
      date.setMinutes(minutes + 30);
    }
  }
  return date.getTime();
}

function weightedRandom(min, max) {
  return Math.round(max / (Math.random() * max + min));
}

const jackpot_descriptor_map = {
  200: "small", // 0-200
  1000: "medium", // 101-500
  5000: "large", // 501-2000
  10000: "huge", // 2001->Infinity
};

const jackpot_flavor_text = {
  small: [
    "Awesome! That was quick!",
    "GG EZ",
    "gg game",
    "Wow, kinda small jackpot but congrats",
    "Everyone's jealous!",
    "Buy yourself something nice.",
    "Man ngl i'm a lil jealous",
    "Nice maybe buy an avatar or some shit",
  ],
  medium: [
    "Awww yeah, the jackpot! You deserve it.",
    "Wow! Look at that jackpot!",
    "We all knew you'd win it.",
    "Now that's diligence.",
    "Cha-ching, nice boii",
    "Go tell your mom!",
    "Shiiit you finally won something!",
    "Looks like you're not a loser after all.",
    "Take it all you greedy bastard",
  ],
  large: [
    "Holy shit! That's a LOT of keycaps!",
    "INTRODUCING: The Jeff Bezos of keycaps",
    "Jesus CHROIST! Everyone bow down...",
    "WOW, that's a SHITLOAD!!! MARRY ME",
    "DAAYUUMM SONNN DADDY GONBE PROUD BOI",
  ],
  huge: [
    "WHAT THE FUCK HOW WHAT, AYO WHAT",
    "JESUS CHRIST THAT'S FUCKLOAD",
    "GOD, FINALLY JESUS CHRIST",
    "🥵🥵🥵💦 u got me wet bruh",
    "YOOOO WHAT THE FUCK",
    "MAJOR STONKS, YOU CAN BUY ALL OF ROBOLAB NOW!!!",
    "FUCKKKK YES KID WE GONNA GET LAID TONIGHT",
    "AAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHH!!!!!!",
  ],
};

const decide_flavor = (flavormap, x) => {
  return jackpot_descriptor_map[
    Object.keys(flavormap).find(
      (y, i) => x <= y && x < Object.keys(flavormap)[i + 1]
    ) || Object.keys(flavormap)[Object.keys(flavormap).length - 1]
  ];
};

const lock = {};
const general_channels = [ch_general, dev_feed];

const generateDailyAfterMessage = () => {
  const dailyAfterMessage = [
    "Did you know you can `/pray` to get keycaps and XP? Try it out!",
    "Check the `/jackpot` every day! You might be the lucky winner when you claim a daily!",
    "Did you know that daily rewards INCREASE when you level up more? Check your `/xp` often!",
    "You can boost this server to earn TWICE the rewards in Discord!",
    "Try starting a conversation! You might meet someone new!",
    "Did you know that you can check your MechaKeys keystrokes in Discord? Try `/profile`",
    "Did you know that you can check your MechaKeys leaderboard rank in Discord? Try `/rank`",
    "Come back tomorrow for more rewards!",
    "Here's a pro-tip, talking more increases how much XP you earn! Check out the bar next to the channel name!",
    "You can buy keycaps in MechaKeys and earn TWICE the rewards in Discord!",
    "Did you know that 2x rewards also apply to the jackpot? Get to boosting and buying, quickly!",
    "The higher your level, the more rewards you get. Try starting a conversation!",
    "Say hi to someone when they claim their daily!",
    "Dailies aren't the only way to get XP and keycaps, try talking to someone new!",
    "Try asking a staff member to start a minigame!",
    "You unlock new commands as you level up!",
    "Discord levels unlock new achievements in MechaKeys!",
    "Getting first place on the Weekly Leaderboard gives you 1000 keycaps!",
  ];

  return dailyAfterMessage[
    Math.floor(Math.random() * dailyAfterMessage.length)
  ];
};

module.exports = {
  alias: ['d'],
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim a daily reward every day"),

  async execute(interaction) {
    await interaction.deferReply();

    if (lock[interaction.user.id]) {
      return interaction.editReply({
        content: "You already claimed a daily reward!",
        ephemeral: true,
      });
    }
    lock[interaction.user.id] = true;

    const guild = interaction.client.guilds.cache.get(interaction.guild.id);
    const userXP = await xpBot.getXP(interaction.user.id);

    const checkLinkedUser = guild.members.cache.get(interaction.user.id);

    if (!checkLinkedUser.roles.cache.get(Role_Linked)) {
      if (await isLinked_discordID(interaction.user.id)) {
        checkLinkedUser.roles.add(Role_Linked);
      } else {
        lock[interaction.user.id] = false;
        return interaction.channel.send(
          `You can't claim a daily reward without linking your account first! Please go to <#${ch_linkChannel}>, then try \`/daily\``
        );
      }
    }

    if (!general_channels.includes(interaction.channel.id)) {
      lock[interaction.user.id] = false;
      let notGeneralChannelEmb = new EmbedBuilder()
        .setDescription(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to use daily in a public channel like <#${ch_general}>!`
        )
        .setColor("2f3136");
      return await interaction.editReply({ embeds: [notGeneralChannelEmb] });
    }

    let valid_claimRes = await discordAPI.claimDaily(interaction.user.id);
    if (!valid_claimRes) {
      lock[interaction.user.id] = false;
      return interaction.editReply(
        `<a:red_siren:812813923522183208> Oops, <@${interaction.user.id}>! Something went wrong when claiming your daily reward.`
      );
    }
    const valid_claim = valid_claimRes
    if (!valid_claim.success) {
      lock[interaction.user.id] = false
      const bot_early_response = await interaction.editReply(
        `<a:red_siren:812813923522183208> Oops, <@${interaction.user.id}>! ${
          valid_claim.message || "Something broked!"
        }`
      )
      return
    }

    const jackpot = {
      current: valid_claim.data.jackpot.current,
      winnings: valid_claim.data.jackpot.winnings || 0,
    };
    let jackpot_descriptor = decide_flavor(
      jackpot_descriptor_map,
      jackpot.winnings
    );
    let jackpot_message = "";

    if (jackpot.winnings) {
      jackpot_message += `\n╔═══════🎉═══════╗\n**YOU WON THE JACKPOT!!!** \n ** 🏆 ${
        jackpot.winnings
      }${
        isBooster(interaction.guild, interaction.user.id) ? "(x2)" : ""
      }** keycaps!\n╚═══════🎉═══════╝`;
    } else {
      jackpot_message += `\nYou did not win the jackpot this time.\nCurrent jackpot: **${jackpot.current}** keycaps.`;
    }

    const rewardBase =
      weightedRandom(1, userXP.level || 2) +
      Math.round(weightedRandom(1, userXP.level || 2) / 2) +
      weightedRandom(1, userXP.level || 2);

    const reward = {
      keycaps: {
        amount: rewardBase,
      },
      xp: {
        amount: rewardBase * 10,
      },
    };

    const rewardToGive =
      Object.keys(reward)[
        Math.floor(Math.random() * Object.keys(reward).length)
      ];
    const description = jackpot.winnings
      ? jackpot_message
      : `Nice! You gained \`${reward[rewardToGive].amount}${
          isBooster(interaction.guild, interaction.user.id) ? "(x2)" : ""
        } ${rewardToGive}!\`\nYou did not win the jackpot this time. \n**Current Jackpot:** ${
          jackpot.current
        } keycaps`;

    let emb = new EmbedBuilder()
      .setDescription(description)
      .setAuthor({
        name: interaction.user.username + " collected a daily reward!",
        iconURL: interaction.user.avatarURL(),
      })
      .setThumbnail(
        jackpot.winnings
          ? `https://mechakeys.robolab.io/discord/media/jackpot/jackpot_${jackpot_descriptor}.gif`
          : gifs[rewardToGive][
              Math.floor(Math.random() * gifs[rewardToGive].length)
            ]
      )
      // .setFooter(jackpot_footer, jackpot.winnings ? `https://mechakeys.robolab.io/discord/media/jackpot/jackpot_${jackpot_descriptor}.gif` : 'https://mechakeys.robolab.io/discord/media/daily/pepe_thonk.png')
      .setColor("#c62783");

    interaction.editReply({ embeds: [emb] });

    if ( userXP < 500 ) { // 500xp == level 5. 
      // could add random chance too || (Math.random() > 0.5)
      // could get xp from static/xpLevels.js
      setTimeout(() => {
        interaction.channel.send(
          `<@${interaction.user.id}>: ${generateDailyAfterMessage()}`
        );
      }, 10000);
    }
    
    if (jackpot.winnings) {
      await keycapAPI.awardKeycaps(
        interaction.guild,
        interaction.user.id,
        jackpot.winnings,
        "discordjackpot"
      );
      pyroBar.fillDatBoost(interaction.client, 90, ch_general, 480);
    }
    if (rewardToGive === "keycaps") {
      await keycapAPI.awardKeycaps(
        interaction.guild,
        interaction.user.id,
        reward[rewardToGive].amount,
        "dailydiscord"
      );
    } else if (rewardToGive === "xp") {
      await xpBot.giveXP(
        interaction.user,
        reward[rewardToGive].amount,
        interaction.channel,
        interaction.client
      );
    }
    pyroBar.fillDatBoost(interaction.client, 1, ch_general, 10);
    lock[interaction.user.id] = false;
    await createEvent.directMessageUserInFuture(
      interaction.guild.id,
      interaction.user.id,
      roundUpToNearestThirty(Date.now() + 84600000),
      true,
      false,
      "dailydiscord_reminder"
    );
    return;
  },
};
