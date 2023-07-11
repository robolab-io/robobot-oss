const xpBot = require("../utils/xpBot")
const pyroBar = require("../utils/pyroBar")

const { internal } = require("robo-bot-utils")

module.exports = async (msg) => {
  if (await internal.filterMessage(msg)) return

  pyroBar.fillDatBoost(msg.client, 1, "462274708499595266", 5)
  const multiplier = pyroBar.getMultiplier(msg.client, "462274708499595266") || 1

  const xpToGive = internal.xpToGive(multiplier)

  await xpBot.giveXP(msg.author, xpToGive, msg.channel, msg.client)
}
