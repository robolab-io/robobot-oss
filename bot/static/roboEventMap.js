const { EmbedBuilder } = require("discord.js");
const wait = require("../utils/wait");
const pyroBar = require("../utils/pyroBar");
const { discordAPI } = require("robo-bot-utils");
const records = require("../utils/records");

const unidentified_falling_object = [
  "A ray of light breaks through the clouds, and you can see something falling down towards your stupid Earth!",
  "Seemingly from the heavens, something seems to be tumbling down to you from above!",
  "Is this a gift from Robo-bot? Maybe, what's inside!?",
  "Robo-bot himself tears open the clouds and extends his giant hand down to you mere mortals, holding a gift.",
  "A **lightning strike** struck the ground next to you and left a smoldering crater... but it looks like there's something inside amidst the smoke...",
  'Robo-bot appears in front of you.\n> "Beg, peasants."',
  "Robo-bot crashes onto the ground and holds up a bag in the air.",
  "Robo-bot appears, handsome as ever, and asks who wants a blessing.",
];

const falling_keycaps_solo = [
  "A bag of shiny keycaps is falling from the sky!",
  "A bucket of keycaps is falling from the sky! Catch it!",
  "What the heck is that? Is that... a bag of keycaps?",
  "Woah! Looks like a box of keycaps is falling from the sky!",
  "What is that? A big ol' bag of keycaps, falling from the heavens!?",
  "Uhhh, guys, is that a bag of keycaps falling from above???",
  "Hey cool convo guys, but it looks like keycaps are falling from the sky!",
];

const falling_xp_solo = [
  "Nice! A big ball of XP is barreling towards us! Ready to grab it?",
  "The heavens poops out a big bundle of XP, who will be the lucky soul to get it?",
  "Yes!!! Robo-bot must be pleased, get ready to grab that XP!",
  "The storm clouds dissipate and a giant ball of XP is tumbling towards the Earth!",
];

const ufo_solo_gifs = [
  "ufo1.gif",
  "ufo2.gif",
  "ufo3.gif",
  "ufo4.gif",
  "ufo5.gif",
];
const ufo_multi_gifs = ["multi_ufo5.gif"];

const falling_keycaps_multi = [
  "Shhhhh shut the fuck up everyone! IT'S RAINING **KEYCAPS**!",
  "Holy shit, it's happening! **KEYCAPS** ARE RAINING DOWN UPON US!",
  "Woah, is that... wait... that's **MULTIPLE BAGS OF KEYCAPS** FALLING FROM ABOVE!",
];
const falling_xp_multi = [
  "PARTY TIME! IT'S RAINING **XP!**",
  "Those stupid clouds in the sky open up and start RAINING DOWN **XP** UPON US MORTAL SOULS!",
  "Blessed be to Robo-bot, is that-- is that **XP???** INCOMING!!!",
  "Woah, woah, cool convo and all, but I think that's a bird, wait no, it's XP falling from the sky!",
];
const angry_robo_gifs = [
  "angry_robo01.gif",
  "angry_robo02.gif",
  "angry_robo03.gif",
];
const angry_robo_start = [
  "Someone pissed off Robo-bot. Now he demands praytime!",
  "Someone pissed off Robo-bot. Now he demands respect!",
  "Robo-bot is PISSED! What did you do to him!?",
  "Oh god, OH GOD! IT'S ROBO-BOT! And he's *pissed!*",
  "WE DONE DID IT NOW! ROBO-BOT CAME DOWN TO SPANK US ALL!!!",
  '"You know the drill, get down on those knees, peasants."',
  '"I\'m here to kick your butts. You made me ANGERY!"',
  "The sky ignites like hell and Robo-bot angrily storms towards you.",
  "Robo-bot DEMANDS your submission. Bow before he smites all who defies him!",
];

const jackpot_increase_start = [
  "Robo-bot smiled upon us and increased the Jackpot by $keycaps!",
  "Robo-bot decided to splash us with a blessing, and he added $keycaps to the Jackpot!",
  "Robo-bot just donated $keycaps to the Jackpot! Thank you, Robo-bot!",
];

const channel_boost_start = [
  "Robo-bot just BIZZOOOSTED this channel! MOAR XP!",
  "Robo-bot AMPED UP this channels XP boost! MOAR XP!",
  "Robo-bot just upped the XP boost!",
  "Robo-bot filled up the XP BOOST BAR!!!",
];

const xpBot = require("../utils/xpBot");
const keycapAPI = require("../utils/keycapAPI");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  solo_keycapDrop: {
    maxClaimers: 1,
    maxTime: 13500,
    rewardType: "keycap",
    get rewardAmt() {
      return getRandomInt(1, 12);
    },
    preWatchTime: 1000,
    prePromptTime: 3500,
    prePromptRandomMS: 3000,
    acceptedResponses: [
      "GIBBIT",
      "GIB",
      "GIB ME",
      "GIVE ME",
      "PLS GIVE!!",
      "PLEASE GIVE",
      "PLEASE GIB!",
      "PLS GIB",
      "PLS GIBBIT!!",
      "GIVE IT",
      "I WANT IT!",
      "GOD PLEASE GIB",
      "GIBIT",
    ],
    flavor: {
      startMessage: [...unidentified_falling_object, ...falling_keycaps_solo],
      startGif: [...ufo_solo_gifs],
    },
    eventStartTrigger: async function (evO) {
      const triggerWord =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const triggerWord2 =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];

      const emb = new EmbedBuilder()
        .setTitle("Something's happening...")
        .setDescription(flavorText)
        .setThumbnail(
          `https://mechakeys.robolab.io/discord/media/events/falling/${
            evO.flavor.startGif[
              Math.floor(Math.random() * evO.flavor.startGif.length)
            ]
          }`
        )
        .setColor("#f9ffdb");

      evO.channel.send({ embeds: [emb] });
      await wait(evO.prePromptTime + Math.random() * evO.prePromptRandomMS);
      evO.record_startTime = Date.now();
      evO.channel.send(
        `✨Type something like \`${triggerWord}\` ${
          triggerWord2 !== triggerWord ? `or \`${triggerWord2}\`` : ""
        } to grab it!!! Quick!`
      );
      return;
    },
    eventMsgTrigger: async function (msg, evO) {
      records.checkRecord(
        evO.guild.id,
        "roboevents",
        "fastestClaim",
        Date.now() - evO.record_startTime,
        "less",
        msg.author.id,
        msg
      );
      console.log(msg.author.username, "claimed!");
      await discordAPI.incrementField(msg.author.id, {
        field: "roboRewardsClaimed",
      });
      if (evO.rewardType === "keycap") {
        keycapAPI.giveKeycaps(msg.author.id, evO.rewardAmt, "event");
      }
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
    },
    eventEndTrigger: function (evO) {
      if (evO.claimers.length) {
        evO.channel.send(
          `🛑 <@${evO.claimers[0]}> snatched ${
            evO.rewardType === "keycap"
              ? `<:minikeycap:811257663194660876>${evO.rewardAmt}`
              : evO.rewardType === "xp"
              ? `${evO.rewardAmt}xp`
              : `${evO.rewardAmt} ${evO.rewardType}`
          } before anyone else could!`
        );
      } else {
        evO.channel.send(
          "🛑 No one claimed the keycaps, and they evaporated into the ether, forever."
        );
      }
    },
  },

  solo_xpDrop: {
    maxClaimers: 1,
    maxTime: 13500,
    rewardType: "xp",
    get rewardAmt() {
      return getRandomInt(20, 150);
    },
    preWatchTime: 1000,
    prePromptTime: 3500,
    prePromptRandomMS: 3000,
    acceptedResponses: [
      "GIBBIT",
      "GIB",
      "GIB ME",
      "GIVE ME",
      "PLS GIVE!!",
      "PLEASE GIVE",
      "PLEASE GIB!",
      "PLS GIB",
      "PLS GIBBIT!!",
      "GIVE IT",
      "I WANT IT!",
      "GOD PLEASE GIB",
      "GIBIT",
    ],
    flavor: {
      startMessage: [...unidentified_falling_object, ...falling_xp_solo],
      startGif: [...ufo_solo_gifs],
    },
    eventStartTrigger: async function (evO) {
      const triggerWord =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const triggerWord2 =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];

      const emb = new EmbedBuilder()
        .setTitle("Something's happening...")
        .setDescription(flavorText)
        .setThumbnail(
          `https://mechakeys.robolab.io/discord/media/events/falling/${
            evO.flavor.startGif[
              Math.floor(Math.random() * evO.flavor.startGif.length)
            ]
          }`
        )
        .setColor("#f9ffdb");

      evO.channel.send({ embeds: [emb] });
      await wait(evO.prePromptTime + Math.random() * evO.prePromptRandomMS);
      evO.record_startTime = Date.now();
      evO.channel.send(
        `✨Type something like \`${triggerWord}\` ${
          triggerWord2 !== triggerWord ? `or \`${triggerWord2}\`` : ""
        } to grab it!!! Quick!`
      );
      return;
    },
    eventMsgTrigger: function (msg, evO) {
      records.checkRecord(
        evO.guild.id,
        "roboevents",
        "fastestClaim",
        Date.now() - evO.record_startTime,
        "less",
        msg.author.id,
        msg
      );
      console.log(msg.author.username, "claimed!");
      discordAPI.incrementField(msg.author.id, { field: "roboRewardsClaimed" });
      if (evO.rewardType === "keycap") {
        keycapAPI.giveKeycaps(msg.author.id, evO.rewardAmt, "event");
      }
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
    },
    eventEndTrigger: function (evO) {
      if (evO.claimers.length) {
        evO.channel.send(
          `🛑 <@${evO.claimers[0]}> snatched ${
            evO.rewardType === "keycap"
              ? `<:minikeycap:811257663194660876>${evO.rewardAmt}`
              : evO.rewardType === "xp"
              ? `${evO.rewardAmt}xp`
              : `${evO.rewardAmt} ${evO.rewardType}`
          } before anyone else could!`
        );
      } else {
        evO.channel.send(
          "🛑 No one claimed the reward, and they evaporated into the ether, forever."
        );
      }
    },
  },

  multi_keycapDrop: {
    get maxClaimers() {
      return getRandomInt(4, 25);
    },
    get maxTime() {
      return getRandomInt(10000, 20000);
    },
    preWatchTime: 1000,
    prePromptTime: 3500,
    prePromptRandomMS: 1000,
    rewardType: "keycap",
    get rewardAmt() {
      return getRandomInt(1, 12);
    },
    acceptedResponses: [
      "GIBBIT",
      "GIB",
      "GIB ME",
      "GIVE ME",
      "PLS GIVE!!",
      "PLEASE GIVE",
      "PLEASE GIB!",
      "PLS GIB",
      "PLS GIBBIT!!",
      "GIVE IT",
      "I WANT IT!",
      "GOD PLEASE GIB",
      "GIBIT",
    ],
    flavor: {
      startMessage: [...unidentified_falling_object, ...falling_keycaps_multi],
      startGif: [...ufo_multi_gifs],
    },
    eventStartTrigger: async function (evO) {
      const triggerWord =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const triggerWord2 =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];
      const emb = new EmbedBuilder()
        .setTitle("Something's happening...")
        .setDescription(flavorText)
        .setThumbnail(
          `https://mechakeys.robolab.io/discord/media/events/falling/${
            evO.flavor.startGif[
              Math.floor(Math.random() * evO.flavor.startGif.length)
            ]
          }`
        )
        .setColor("#f9ffdb");
      evO.channel.send({ embeds: [emb] });
      await wait(evO.prePromptTime + Math.random() * evO.prePromptRandomMS);
      evO.record_startTime = Date.now();
      evO.channel.send(
        `✨Type something like \`${triggerWord}\` ${
          triggerWord2 !== triggerWord ? `or \`${triggerWord2}\`` : ""
        } to grab it!!! Quick!`
      );
      return;
    },
    eventMsgTrigger: function (msg, evO) {
      records.checkRecord(
        evO.guild.id,
        "roboevents",
        "fastestClaim",
        Date.now() - evO.record_startTime,
        "less",
        msg.author.id,
        msg
      );
      console.log(msg.author.username, "claimed!");
      discordAPI.incrementField(msg.author.id, { field: "roboRewardsClaimed" });
      evO.channel.send(
        `🤲<@${msg.author.id}> grabbed ${
          evO.rewardType === "keycap"
            ? `<:minikeycap:811257663194660876>${evO.rewardAmt}`
            : evO.rewardType === "xp"
            ? `${evO.rewardAmt}xp`
            : `${evO.rewardAmt} ${evO.rewardType}`
        }!`
      );
      if (evO.rewardType === "keycap") {
        keycapAPI.giveKeycaps(msg.author.id, evO.rewardAmt, "event");
      }
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
    },
    eventEndTrigger: function (evO) {
      if (evO.claimers.length) {
        evO.channel.send("🛑 That's all the keycaps! Thank you Robo-bot!");
      } else {
        evO.channel.send(
          "🛑 No one caught any of the keycaps, and they all got eaten by the rats."
        );
      }
    },
  },

  multi_xpDrop: {
    get maxClaimers() {
      return getRandomInt(4, 25);
    },
    get maxTime() {
      return getRandomInt(10000, 20000);
    },
    preWatchTime: 1000,
    prePromptTime: 3500,
    prePromptRandomMS: 1000,
    rewardType: "xp",
    get rewardAmt() {
      return getRandomInt(20, 150);
    },
    acceptedResponses: [
      "GIBBIT",
      "GIB",
      "GIB ME",
      "GIVE ME",
      "PLS GIVE!!",
      "PLEASE GIVE",
      "PLEASE GIB!",
      "PLS GIB",
      "PLS GIBBIT!!",
      "GIVE IT",
      "I WANT IT!",
      "GOD PLEASE GIB",
      "GIBIT",
    ],
    flavor: {
      startMessage: [...unidentified_falling_object, ...falling_xp_multi],
      startGif: [...ufo_multi_gifs],
    },
    eventStartTrigger: async function (evO) {
      const triggerWord =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const triggerWord2 =
        evO.acceptedResponses[
          Math.floor(Math.random() * evO.acceptedResponses.length)
        ];
      const flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];
      const emb = new EmbedBuilder()
        .setTitle("Something's happening...")
        .setDescription(flavorText)
        .setThumbnail(
          `https://mechakeys.robolab.io/discord/media/events/falling/${
            evO.flavor.startGif[
              Math.floor(Math.random() * evO.flavor.startGif.length)
            ]
          }`
        )
        .setColor("#f9ffdb");
      evO.channel.send({ embeds: [emb] });
      await wait(evO.prePromptTime + Math.random() * evO.prePromptRandomMS);
      evO.record_startTime = Date.now();
      evO.channel.send(
        `✨Type something like \`${triggerWord}\` ${
          triggerWord2 !== triggerWord ? `or \`${triggerWord2}\`` : ""
        } to grab it!!! Quick!`
      );
      return;
    },
    eventMsgTrigger: function (msg, evO) {
      records.checkRecord(
        evO.guild.id,
        "roboevents",
        "fastestClaim",
        Date.now() - evO.record_startTime,
        "less",
        msg.author.id,
        msg
      );
      console.log(msg.author.username, "claimed!");
      discordAPI.incrementField(msg.author.id, { field: "roboRewardsClaimed" });
      evO.channel.send(
        `🤲<@${msg.author.id}> grabbed ${
          evO.rewardType === "keycap"
            ? `<:minikeycap:811257663194660876>${evO.rewardAmt}`
            : evO.rewardType === "xp"
            ? `${evO.rewardAmt}xp`
            : `${evO.rewardAmt} ${evO.rewardType}`
        }!`
      );
      if (evO.rewardType === "keycap") {
        keycapAPI.giveKeycaps(msg.author.id, evO.rewardAmt, "event");
      }
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
    },
    eventEndTrigger: function (evO) {
      if (evO.claimers.length) {
        evO.channel.send("🛑 That's all the XP! Praise Robo-bot!");
      } else {
        evO.channel.send(
          "🛑 No one claimed any of the XP, and now all the rats leveled up!"
        );
      }
    },
  },

  jackpot_increase: {
    maxClaimers: 10,
    maxTime: 7000,
    preWatchTime: 10,
    prePromptTime: 10,
    prePromptRandomMS: 10,
    get increaseAmt() {
      return getRandomInt(10, 100);
    },
    rewardType: "xp",
    rewardAmt: 10,
    acceptedResponses: [
      "THX",
      "THANK YOU",
      "THANKS",
      "THANK U",
      "BLESS YOU",
      "I LOVE YOU",
      "THANKS ROBOBOT",
      "THANKS ROBO",
      "THANKS ROBO-BOT",
      "THANKS 747491742214783117",
      "THANK YOU 747491742214783117",
    ],
    flavor: {
      startMessage: [...jackpot_increase_start],
      startGif: [...ufo_solo_gifs],
    },
    eventStartTrigger: async function (evO) {
      let flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];
      let textBuilder = "";
      textBuilder += flavorText.replace(
        "$keycaps",
        `<:minikeycap:811257663194660876>**${evO.increaseAmt}**`
      );
      let currentJackpot = await discordAPI.addToJackpot(evO.increaseAmt);
      textBuilder += `\n**Current Jackpot**:<:minikeycap:811257663194660876>${currentJackpot.data.data} keycaps!`;
      const emb = new EmbedBuilder()
        .setTitle("A blessing from Robo-bot!")
        .setDescription(textBuilder)
        .setThumbnail(
          "https://mechakeys.robolab.io/discord/media/jackpot/jackpot_small.gif"
        )
        .setColor("#f9ffdb");
      evO.channel.send({ embeds: [emb] });
      return;
    },
    eventMsgTrigger: function (msg, evO) {
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
      msg.channel.send(
        `<@${msg.author.id}> gained **${evO.rewardAmt}xp** for thanking Robo-bot!`
      );
    },
    // eslint-disable-next-line no-empty-function
    eventEndTrigger: function (evO) {},
  },

  boost_channel: {
    maxClaimers: 10,
    maxTime: 7000,
    preWatchTime: 10,
    prePromptTime: 10,
    prePromptRandomMS: 10,
    get increaseAmt() {
      return getRandomInt(20, 50);
    },
    rewardType: "xp",
    rewardAmt: 10,
    acceptedResponses: [
      "THX",
      "THANK YOU",
      "THANKS",
      "THANK U",
      "BLESS YOU",
      "I LOVE YOU",
      "THANKS ROBOBOT",
      "THANKS ROBO",
      "THANKS ROBO-BOT",
      "THANKS 747491742214783117",
      "THANK YOU 747491742214783117",
    ],
    flavor: {
      startMessage: [...channel_boost_start],
      startGif: [...ufo_solo_gifs],
    },
    eventStartTrigger: async function (evO) {
      let flavorText =
        evO.flavor.startMessage[
          Math.floor(Math.random() * evO.flavor.startMessage.length)
        ];
      let textBuilder = flavorText;
      pyroBar.fillDatBoost(
        evO.client,
        evO.increaseAmt,
        "462274708499595266",
        30
      );
      textBuilder += `\n**Current Boost**: ${pyroBar.getLilBarThingLol(
        evO.client,
        "462274708499595266",
        6
      )}`;
      const emb = new EmbedBuilder()
        .setTitle("Robo-bot blessed the channel!")
        .setDescription(textBuilder)
        .setThumbnail(
          "https://mechakeys.robolab.io/discord/media/xpbot/lvlup_xt1_13.gif"
        )
        .setColor("#f9ffdb");
      evO.channel.send({ embeds: [emb] });
      return;
    },
    eventMsgTrigger: function (msg, evO) {
      if (evO.rewardType === "xp") {
        xpBot.giveXP(msg.author.id, evO.rewardAmt, evO.channel, evO.client);
      }
      msg.channel.send(
        `<@${msg.author.id}> gained **${evO.rewardAmt}xp** for thanking Robo-bot!`
      );
    },
    // eslint-disable-next-line no-empty-function
    eventEndTrigger: function (evO) {},
  },
};
