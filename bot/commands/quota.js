const { SlashCommandBuilder } = require('discord.js');
const commandAccumulator = require('../utils/commandAccumulator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quota')
		.setDescription('View how many uses of a command you have')
		.addStringOption((option) =>
			option
				.setName('command')
				.setDescription('Which command?')
				.setRequired(true)
				.addChoices(
					{ name: 'pray', value: 'pray' },
					{ name: 'giveaway', value: 'giveaway' },
					{ name: 'tip', value: 'tip' },
					{ name: 'fight', value: 'fight' },
				),
		),

	async execute(interaction) {
		await interaction.deferReply();
		const command = interaction.options.getString('command');

		const quota = await commandAccumulator(interaction, command, true, true);
		return quota;
	},
};
