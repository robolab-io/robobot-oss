const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, SelectMenuBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const xpBot = require('../utils/xpBot');
const xpRequirement = { xp: 2000 };

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy an item from the Discord store'),

	async execute(interaction) {
		const currentXP = await xpBot.getXP(interaction.user.id);

		const neededXP = Math.round(xpRequirement.xp - currentXP)
			.toString()
			.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		if (!currentXP || currentXP < xpRequirement.xp) {
			let notEnoughXPEmbed = new EmbedBuilder()
				.setTitle('Not enough XP!')
				.setDescription(
					`<a:red_siren:812813923522183208> You do not have enough XP to perform this action. You need ${neededXP} more XP.`,
				)
				.setColor('2f3136');

			return interaction.editReply({
				embeds: [notEnoughXPEmbed],
				ephemeral: true,
			});
		}

		const buyEmbed = new EmbedBuilder()
			.setTitle('Let\'s buy something!')
			.setColor('#ffaf24')
			.setThumbnail(
				'https://mechakeys.robolab.io/discord/media/pokemon/shopkeep.png',
			)
			.setDescription(
				'Take your pick, make your choice! Remember, these cost keycaps! Check the `/store` if you\'re unsure.',
			);

		const itemActionRow = new ActionRowBuilder().addComponents(
			new SelectMenuBuilder()
				.setCustomId('itemSelect')
				.setPlaceholder('Select an item to buy')
				.addOptions(
					{
						label: 'Pokeball',
						description: 'An item that lets you catch other people for battle!',
						value: 'item_pokeball',
					},
					{
						label: 'Glowing Pencil',
						description: 'Lets you send a message to the future!',
						value: 'item_glowingpencil',
					},
					{
						label: 'Bodyguards',
						description:
              'Defends you against fights! You lose this when you fight.',
						value: 'item_bodyguards',
					},
					{
						label: 'Fist of Doom',
						description: 'A superpowered fight! Larger chance to win!',
						value: 'item_fistofdoom',
					},
					{
						label: 'Bitchslap',
						description: 'A weakened fight! Smaller chance to win!',
						value: 'item_bitchslap',
					},
					{
						label: 'Flying Fist',
						description: 'Lets you hit a Tumbleweed a second time!',
						value: 'item_flyingfist',
					},
					{
						label: 'Boost Device',
						description: 'Hack the channel boost!',
						value: 'item_boostdevice',
					},
					{
						label: 'Gold Relic',
						description: 'Pray with a higher chance of success!',
						value: 'item_goldrelic',
					},
				),
		);

		await interaction.reply({
			embeds: [buyEmbed],
			components: [itemActionRow],
		});
	},
};
