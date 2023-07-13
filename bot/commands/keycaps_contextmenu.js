const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

const {fn} = require('./keycaps')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View Keycaps")
    .setType(ApplicationCommandType.User),

  execute: fn({ ephemeral: true, menu: true })
};
