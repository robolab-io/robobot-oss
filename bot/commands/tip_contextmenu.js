const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

const {fn} = require('./tip')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Tip a Keycap")
    .setType(ApplicationCommandType.User),

  execute: fn({ ephemeral: false, menu: true })
};
