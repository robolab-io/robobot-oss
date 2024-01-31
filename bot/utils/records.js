const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const { static, isDev, discordAPI } = require("robo-bot-utils")
const env = isDev ? 'staging' : 'production'

const { ch_general } = require('../ids')
const xpBot = require("../utils/xpBot");
const pyroBar = require("../utils/pyroBar");
const wait = require("../utils/wait");
const keycapAPI = require("../utils/keycapAPI");
const isBooster = require("../utils/isBooster");



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

const generate_embed = (
  record_key,
  power,
  userID,
  old_power,
  old_userID,
  old_record_time,
  userBoost
) => {
  const recordGif = recordGifs[Math.floor(Math.random() * recordGifs.length)];
  const embed = new EmbedBuilder()
    .setTitle(`A ${rec_master[record_key].category} record has been broken!`)
    .setThumbnail(recordGif)
    .setColor("#ffc948")
    .setFooter({
      text: "When you break a record, you get XP and Keycaps!",
      iconURL: recordGif,
    })
    .setDescription(`═══════ ∘◦ ${
    rec_master[record_key].accent_emoji
  } ◦∘ ════════
      ${rec_master[record_key].label}${
    rec_master[record_key].optional_description
      ? `\n${rec_master[record_key].optional_description}`
      : ""
  }
      ${rec_master[record_key].displayValue(power)}
      **User:** <@${userID}> 🎉
      **Reward:** ${
        rec_master[record_key].reward.keycap * (userBoost ? 2 : 1)
      } keycaps, ${rec_master[record_key].reward.xp * (userBoost ? 2 : 1)}xp
    ═══════ ∘◦  ${rec_master[record_key].accent_emoji} ◦∘ ════════
    `);
  if (old_power) {
    embed.addFields(
      {
        name: "Previous Record",
        value: `${rec_master[record_key].displayValue(old_power)}`,
        inline: true,
      },
      { name: "User", value: `<@${old_userID}>`, inline: true },
      {
        name: "Time",
        value: `${timeConversion(Date.now() - old_record_time)} ago`,
        inline: true,
      }
    );
  }
  return embed;
};

const rec_master = {
  tumblebounce_hardestHit: {
    reward: {
      xp: 1000,
      keycap: 200,
    },
    displayValue: (value) => {
      return `Power: \`${value}\``;
    },
    category: "Tumblebounce",
    label: "💥 **Strongest Hit**",
    accent_emoji: "<:tumbleweed:702482059095965706>",
  },
  tumblebounce_weakestHit: {
    reward: {
      xp: 1000,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Power: \`${value}\``;
    },
    category: "Tumblebounce",
    label: "👶 **Weakest Hit**",
    accent_emoji: "<:tumbleweed:702482059095965706>",
  },
  tumblebounce_fastestHit: {
    reward: {
      xp: 1000,
      keycap: 200,
    },
    displayValue: (value) => {
      return `Reaction time: \`${value}ms\``;
    },
    category: "Tumblebounce",
    label: "💨 **Fastest Hit**",
    accent_emoji: "<:tumbleweed:702482059095965706>",
    maximum_value: 3000,
  },
  tumblebounce_mostPowerfulPlayer: {
    reward: {
      xp: 1000,
      keycap: 200,
    },
    displayValue: (value) => {
      return `Total Power: \`${value}\``;
    },
    category: "Tumblebounce",
    label: "💪 **Most Powerful Player**",
    accent_emoji: "<:tumbleweed:702482059095965706>",
    minimum_value: 1000,
  },
  tumblebounce_longestGameLastHit: {
    reward: {
      xp: 1000,
      keycap: 200,
    },
    displayValue: (value) => {
      return `Game Duration: \`${timeConversion(value)}\``;
    },
    category: "Tumblebounce",
    label: "😏 **Last to hit in longest game**",
    accent_emoji: "<:tumbleweed:702482059095965706>",
    optional_description:
      "*Be the last one to hit the tumbleweed before it falls. The longer the game was, the better the record!*",
    minimum_value: 7200000, // 2 hours
  },
  tumblebounce_longestGameStartedBy: {
    reward: {
      xp: 1000,
      keycap: 200,
    },
    displayValue: (value) => {
      return `Game Duration: \`${timeConversion(value)}\``;
    },
    category: "Tumblebounce",
    label: "🏁 **Started longest game**",
    optional_description:
      "*Donators can start games! Whoever starts the game gets this award for long games.*",
    accent_emoji: "<:tumbleweed:702482059095965706>",
    minimum_value: 14400000, // 4 hours
  },
  secretpepe_fastestFind: {
    reward: {
      xp: 1000,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Find Time: \`${value} seconds\``;
    },
    category: "Secret Pepe",
    label: "🔍 **Fastest Pepe Find**",
    accent_emoji: "<:robo_pepeShhh:780486164963786822>",
  },
  secretpepe_slowestFind: {
    reward: {
      xp: 1000,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Find Time: \`${(value / 60).toFixed(2)} minutes\``;
    },
    category: "Secret Pepe",
    label: "🕵️‍♂️ **Pepe Cracker Award**",
    accent_emoji: "<:robo_pepeShhh:780486164963786822>",
    optional_description:
      "*Slowest time to find Pepe, he must have been a sneaky one!*",
  },
  bombsquad_fastestEmojiriddle: {
    reward: {
      xp: 100,
      keycap: 50,
    },
    displayValue: (value) => {
      return `Solve Time: \`${value / 1000} seconds\``;
    },
    category: "Bombsquad",
    label: "🔧 **Fastest Emoji Riddle**",
    accent_emoji: "💣",
  },
  bombsquad_fastestNumcode: {
    reward: {
      xp: 300,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Solve Time: \`${value / 1000} seconds\``;
    },
    category: "Bombsquad",
    label: "🧮 **Fastest Number Code**",
    accent_emoji: "💣",
    maximum_value: 12000,
  },
  bombsquad_fastestWordriddle: {
    reward: {
      xp: 100,
      keycap: 50,
    },
    displayValue: (value) => {
      return `Solve Time: \`${value / 1000} seconds\``;
    },
    category: "Bombsquad",
    label: "💬 **Fastest Word Riddle**",
    accent_emoji: "💣",
    maximum_value: 6000,
  },
  bombsquad_solveClosestToExplosion: {
    reward: {
      xp: 200,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Time Left: \`${value / 1000 + 1} seconds\``;
    },
    category: "Bombsquad",
    label: "😅 **Nailbiter Award!**",
    accent_emoji: "💣",
    optional_description: "*Complete a defusal stage close to explosion time!*",
    maximum_value: 10000,
  },
  fight_mostUnlikelyWin: {
    reward: {
      xp: 200,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Chance to Win: \`${value}%\``;
    },
    category: "Fight",
    label: "👊 **Victorious Underdog!**",
    accent_emoji: "⚔️",
    maximum_value: 5,
  },
  fight_killedRobobot: {
    reward: {
      xp: 500,
      keycap: 50,
    },
    displayValue: (value) => {
      return `Kill time: \`${timeConversion(value)} ago\``;
    },
    category: "Fight",
    label: "<:cute_robo_broked:816198206718738442> **Last to Kill Robo-bot!**",
    accent_emoji: "<:cute_robo_smokie:816196974088290305>",
  },
  roboevents_fastestClaim: {
    reward: {
      xp: 500,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Reaction time: ${value}ms`;
    },
    category: "Robo Events",
    label: "🤲 **Fastest Reward Claim!**",
    optional_description: "*Claimed a random robo reward really fast!*",
    accent_emoji: "<:giftkeycap:811257704138932234>",
    maximum_value: 500, // 500 ms
  },
  roboevents_closestCallRoboDeath: {
    reward: {
      xp: 500,
      keycap: 100,
    },
    displayValue: (value) => {
      return `Time Left: ${value}ms`;
    },
    category: "Robo Events",
    label: "<:robo_angry:842796702494228530>**Closest call!**",
    optional_description: "*Begged for mercy at the last... millsecond?*",
    accent_emoji: "🔥",
    maximum_value: 1000, // 1 second
  },
};
const recordGifs = [
  "https://mechakeys.robolab.io/discord/media/records/record_2.gif",
  "https://mechakeys.robolab.io/discord/media/records/record_1.gif",
  "https://mechakeys.robolab.io/discord/media/records/record_3.gif",
  "https://mechakeys.robolab.io/discord/media/records/record_4.gif",
];
module.exports = {
  record_list: (guildID) => {
    let list = Object.keys(rec_master);
    list = list.map((x) => {
      return {
        record_id: `g_${env}_${guildID}_${x}`,
        record_info: rec_master[x],
      };
    });
    return list;
  },
  // key is guildID_recordLocation_recordName
  // 462274708499595264_tumblebounce
  checkRecord: async (guildID, key, field, fieldValue, goal, userID, msg) => {
    console.log(key, field, fieldValue);
    if (
      rec_master[`${key}_${field}`].minimum_value &&
      fieldValue < rec_master[`${key}_${field}`].minimum_value
    ) {
      console.log(
        `Not checking because ${fieldValue} is less than ${
          rec_master[`${key}_${field}`].minimum_value
        }`
      );
      return false;
    }
    if (
      rec_master[`${key}_${field}`].maximum_value &&
      fieldValue > rec_master[`${key}_${field}`].maximum_value
    ) {
      console.log(
        `Not checking because ${fieldValue} is greater than ${
          rec_master[`${key}_${field}`].maximum_value
        }`
      );
      return false;
    }

    //  g_staging_462274708499595264_tumblebounce_hardestHit
    const { data } = await discordAPI.checkRecord(userID, `g_${env}_${guildID}_${key}_${field}`, fieldValue, goal)

    if (data.recordBroken) {
      const oldRecord = data.oldRecord || {};
      const newRecord = data.newRecord;
      const userBoost = isBooster(msg.guild, userID);
      await wait(2000);
      msg.channel.send({
        embeds: [generate_embed(
          `${key}_${field}`,
          newRecord.fieldValue,
          newRecord.userID,
          oldRecord.fieldValue,
          oldRecord.userID,
          oldRecord.record_time,
          userBoost
        )]
      });
      xpBot.giveXP(
        userID,
        rec_master[`${key}_${field}`].reward.xp,
        msg.channel,
        msg.client
      );
      keycapAPI.awardKeycaps(
        msg.guild,
        userID,
        rec_master[`${key}_${field}`].reward.keycap,
        "recordBroken"
      );

      pyroBar.fillDatBoost(msg.client, 60, ch_general, 180);
      // send message to discord
      // give awards
    }
    return data;
  }
};
