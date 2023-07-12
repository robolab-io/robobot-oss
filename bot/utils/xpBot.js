const { devAPI, isDev } = require("robo-bot-utils")
const { 
  Role_Linked, ch_general, Item_bodyguards,
  Level_3, Level_10, Level_15, Level_20, Level_30, Level_40
} = require('../ids')

const { EmbedBuilder } = require("discord.js")
const levels = require("../static/xpLevels")
const isBooster = require("./isBooster")
const pyroBar = require("../utils/pyroBar")

// NOTE: non-inclusive of min value
function between(x, min, max) {
  return x > min && x <= max
}

const xpCommands = {
  giveXP: async (user, XPamount, channel, client) => {
    if (isDev) return

    const id = user.id || user;
    const guild = client.guilds.cache.get(channel.guild.id);
    const userObj = guild.members.cache.get(id);
    let amt = XPamount;
    if (isBooster(guild, id)) {
      amt = (amt || 1) * 2; // double XP for Booster
    }

    console.log('giveRes 1:', id, { amount: amt || 1 })
    const giveRes = await devAPI.giveXP(id, { amount: amt || 1 });
    console.log('giveRes 2:', giveRes)
    if (giveRes && giveRes.success) {
      const currentXP = giveRes.data.xp.Attributes.discordXP;
      const previousXP = currentXP - amt;
      const levelsPassed = levels.filter((x) => {
        return between(x.xp, previousXP, currentXP);
      });

      if (levelsPassed && levelsPassed.length) {
        const allRewards = [].concat.apply(
          [],
          levelsPassed.map((x) => x.rewards)
        );

        const topMessage =
          levelsPassed.length === 1
            ? `<@${id}> leveled up!`
            : `<@${id}> leveled up ${levelsPassed.length} times!`;
        const rewardMessage = `**Rewards:** ${allRewards.join(", ")}`;
        const keycapReward = levelsPassed
          .map((x) => x.keycaps)
          .reduce((a, b) => a + b, 0);
        const thumbnail = levelsPassed[levelsPassed.length - 1].thumbnail;
        const levelMessage =
          levelsPassed[levelsPassed.length - 1].message[
            Math.floor(
              Math.random() *
                levelsPassed[levelsPassed.length - 1].message.length
            )
          ];
        const embed = new EmbedBuilder()
          .setTitle(
            "You leveled up to level " +
              (levelsPassed[levelsPassed.length - 1].level || "error") +
              "!"
          )
          .setThumbnail(thumbnail)
          .setColor("#2bffb8")
          .setFooter({
            text: "Leveling up grants you in-app rewards and Discord abilities!",
            iconURL: "https://mechakeys.robolab.io/discord/media/alert.png",
          })
          .setDescription(`${topMessage}\n ${levelMessage} \n ${rewardMessage} \n **Keycaps:** ${keycapReward}
          `);
        channel.send({ content: `<@${id}>`, embeds: [embed] });
        await devAPI.giveKeycaps(id, {
          amount: keycapReward,
          reason: "discordLevel",
        });

        // NOTE: clean this...
        if (levelsPassed.find((x) => x.level >= 3)) {
          userObj.roles.add(guild.roles.cache.get(Level_3)); // add level 3
          userObj.roles.add(guild.roles.cache.get(Role_Linked)); // linked
        }
        if (levelsPassed.find((x) => x.level === 9)) {
          userObj.roles.add(guild.roles.cache.get(Item_bodyguards)); // bodyguards
        }
        if (levelsPassed.find((x) => x.level >= 10)) {
          userObj.roles.add(guild.roles.cache.get(Level_10)); // level 10
        }
        if (levelsPassed.find((x) => x.level >= 15)) {
          userObj.roles.add(guild.roles.cache.get(Level_15)); // level 15
        }
        if (levelsPassed.find((x) => x.level >= 20)) {
          userObj.roles.add(guild.roles.cache.get(Level_20)); // level 20
        }
        if (levelsPassed.find((x) => x.level >= 30)) {
          userObj.roles.add(guild.roles.cache.get(Level_30)); // level 30
        }
        if (levelsPassed.find((x) => x.level >= 40)) {
          userObj.roles.add(guild.roles.cache.get(Level_40)); // level 40
        }
        pyroBar.fillDatBoost(
          client,
          levelsPassed[levelsPassed.length - 1].level,
          ch_general,
          levelsPassed[levelsPassed.length - 1].level
        );
      }
    }
  },

  getXP: async (id) => {
    const currentXP = await devAPI.getXP(id);
    if (!currentXP || !currentXP.success) {
      return false;
    }

    let userLevelInfo = levels
      .slice()
      .reverse()
      .find((x) => currentXP.data.discordXP >= x.xp) || {
      xp: 10,
      level: 0,
      rewards: ["/rank", "/profile", "minigame rewards!"],
      keycaps: 25,
      thumbnail:
        "https://mechakeys.robolab.io/discord/media/xpbot/levelup1.gif",
    };

    const payload = currentXP;
    payload.levelInfo = userLevelInfo;
    payload.level = userLevelInfo.level;
    payload.next_level = levels.find(
      (x) => x.level === userLevelInfo.level + 1
    );
    payload.xp_to_next_level =
      levels.find((x) => x.level === userLevelInfo.level + 1).xp -
      currentXP.data.discordXP;
    return payload;
  },
};

module.exports = xpCommands;
