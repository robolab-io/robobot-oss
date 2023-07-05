const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const {
	ActionRowBuilder,
} = require('discord.js');
const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Developer-only - Create a link account message'),

	async execute(interaction) {
		const linkEmbed = new EmbedBuilder()
			.setTitle('Let\'s link your MechaKeys account!')
			.setDescription(
				'To get started, click the button below. You\'ll unlock Discord-exclusive XP, commands, and rewards. This won\'t take longer than 30 seconds.',
			)
			.setColor('2f3136');

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('startLinkutton')
				.setLabel('Get Linked')
				.setEmoji('⚡')
				.setStyle(ButtonStyle.Primary),
		);

		interaction.channel.send({ embeds: [linkEmbed], components: [row] });
		interaction.reply({
			content: 'Created a new link message!',
			ephemeral: true,
		});
	},
};
