const { SlashCommandBuilder } = require('discord.js');
const pyroBar = require('../utils/pyroBar');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('channelboost')
		.setDescription('Check the channel\'s current XP boost'),

	async execute(interaction) {
		await interaction.deferReply();

		await interaction.editReply(`${pyroBar.getLilBarThingLol(interaction.client, '462274708499595266', 6)}\n**Channel Boost:** ${pyroBar.getMultiplier(interaction.client, '462274708499595266')}x XP`);
	},
};
