const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

const {fn} = require('./profile')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View Keystrokes")
    .setType(ApplicationCommandType.User),

  execute: fn({ ephemeral: true,  menu: true })
}
