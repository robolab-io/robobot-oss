const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { devAPI } = require("robo-bot-utils");
const xpBot = require("../utils/xpBot");
const xpRequirement = { xp: 10 };

const {fn} = require('./keycaps')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View Keycaps")
    .setType(ApplicationCommandType.User),

  execute: fn({ ephemeral: true })
};
