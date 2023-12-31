const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

const codeTips = require('../static/codeTips');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('codetip')
		.setDescription('Get a code tip!'),

	async execute(interaction) {
		await interaction.deferReply();

		const { tip, media, ref } = codeTips[Math.floor(Math.random() * codeTips.length)];
		const isStaff = interaction.channel.parentId === '777796388649304064';

		var embed = new EmbedBuilder({
			title: 'CODE TIP!',
			color: '1',
			description: 'random code tips, snippets, and thoughts',
			...(media && { image: { url: media } }),
		});
		if (tip) {
			embed.addFields({ name: 'Tip:', value: `${tip}\n\n` });
		}

		if (ref && isStaff) {
			embed.addFields({ name: '\u200B', value: `${ref}` });
		}

		await interaction.editReply({ embeds: [embed] });
	},
};
