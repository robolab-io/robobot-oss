const {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");

const {fn} = require('./stats')

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("View Stats")
    .setType(ApplicationCommandType.User),

  execute: fn({ ephemeral: true, menu: true })
};
