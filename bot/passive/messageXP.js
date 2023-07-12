const xpBot = require("../utils/xpBot")
const pyroBar = require("../utils/pyroBar")

const { internal } = require("robo-bot-utils")
const { ch_general } = require('../ids')

module.exports = async (msg) => {
  if (await internal.filterMessage(msg)) return

  pyroBar.fillDatBoost(msg.client, 1, ch_general, 5)
  const multiplier = pyroBar.getMultiplier(msg.client, ch_general) || 1

  const xpToGive = internal.xpToGive(multiplier)

  await xpBot.giveXP(msg.author, xpToGive, msg.channel, msg.client)
}
