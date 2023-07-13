const { devAPI } = require("robo-bot-utils")

const isBooster = require("./isBooster")

const keycapAPI = {
  // NO BOOST MODIFIER (direct)
  giveKeycaps: async (userID, amount, reason) => {
    return await devAPI.giveKeycaps(userID, { amount: amount, reason: reason })
  },
  // BOOST MODIFIER APPLIES
  awardKeycaps: async (guild, userID, amount, reason) => {
    let amt = amount
    if (isBooster(guild, userID)) {
      amt = (amt || 1) * 2 // double XP for Booster
    }
    return await devAPI.giveKeycaps(userID, { amount: amt, reason: reason })
  },
};

module.exports = keycapAPI
