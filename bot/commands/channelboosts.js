const { SlashCommandBuilder } = require('discord.js');
const { ch_general } = require('../ids')
const pyroBar = require('../utils/pyroBar');

module.exports = {
	alias: ['checkboost'],
	data: new SlashCommandBuilder()
		.setName('channelboost')
		.setDescription('Check the channel\'s current XP boost'),

	async execute(interaction) {
		await interaction.deferReply();

		await interaction.editReply(
			`${pyroBar.getLilBarThingLol(interaction.client, ch_general, 6)}\n**Channel Boost:** ${pyroBar.getMultiplier(interaction.client, ch_general)}x XP`
		);
	},
};
