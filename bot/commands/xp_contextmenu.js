const {
	ContextMenuCommandBuilder,
	ApplicationCommandType
} = require('discord.js');

const {fn} = require('./xp')

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName('View Level')
		.setType(ApplicationCommandType.User),

	execute: fn({ ephemeral: true, menu: true })
}
