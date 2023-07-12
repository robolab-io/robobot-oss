const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { cat_staff } = require('../ids')

const codeTips = require('../static/codeTips');

module.exports = {
	alias: ['ct'],
	data: new SlashCommandBuilder()
		.setName('codetip')
		.setDescription('Get a code tip!'),

	async execute(interaction) {
		await interaction.deferReply();

		const { tip, media, ref } = codeTips[Math.floor(Math.random() * codeTips.length)];
		const isStaff = interaction.channel.parentId === cat_staff;

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
