const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const xpBot = require('../utils/xpBot');

const xpRequirement = { xp: 2000 };

const store_greetings = [
	'Yes, my friend! Welcome to my shop! Have you tried the Glowing Pencil yet? Send a message to the future!',
	'Aha! Welcome to the item shop, my friend. Feel free to browse, peruse, run your fingers along my wares... Ohh, perhaps I should stop there. Have a look!',
	'Hello there! Come on in and dry off, we have plenty of items for you to choose from!',
	'What\'ll it be there, lad?',
	'Back for more, eh laddie?',
	'Ohooo I\'ve got just the thing for you!',
	'Step right in, I\'ve got just the thing you\'re looking for!',
	'Just the one I wanted to see! Come on in and shop around!',
	'Ooohoo look at this one! If you need anything I\'ll be in the back!',
	'Welcome there lad! Have a look at my precious items, but be gentle!',
	'Please take some of these sweaty bodyguards out of here!',
	'These glowing pencils sure are glowy!',
];

let store_flavor =
  store_greetings[Math.floor(Math.random() * store_greetings.length)];

let description = `
${store_flavor}

<:pokeball:816114055143096360> **Pokeball** - costs <:minikeycap:811257663194660876>**10 keycaps**
*Grants an item to be used to /catch other users to use in battle.*

<:glowing_pencil:816114905936953354> **Glowing Pencil** - costs <:minikeycap:811257663194660876>**15 keycaps**
*Grants an item that allows one use of /messageFuture, which SENDS A MESSAGE... to the future!*

<:bodyguards:816114055030767638> **Bodyguards** - costs <:minikeycap:811257663194660876>**25 keycaps**
*Immediately applies "Bodyguards" role. Defends against fight. Careful, if you fight you lose this role!*

:punch: **Fist of Doom** - costs <:minikeycap:811257663194660876>**200 keycaps**
*A superpowered fight! You have a larger chance to win this fight, so much so that you can only use it once every hour!*

💅🏼 **Bitchslap** - costs <:minikeycap:811257663194660876>**10 keycaps**
*A weakened fight! You have a smaller chance to win this fight, but if you win... oh man, that's embarrassing!*

:fist: **Flying Fist** - costs <:minikeycap:811257663194660876>**50 keycaps**
*A cybernetic attachment to your hand! It lets you save a tumblebounce and hit it consecutively!*

:pager: **Boost Device** - costs <:minikeycap:811257663194660876>**25 keycaps**
*A mysterious device that causes the channel XP boost to grow!*

:crown: **Gold Relic** - costs <:minikeycap:811257663194660876>**20 keycaps**
*An ancient artifact made of gold, you can offer it to Robo-bot for a surprise!*

╚════════════════════╝
`;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('store')
		.setDescription('View the Discord store and what you can buy'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

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

		let storeEmbed = new EmbedBuilder()
			.setDescription(description)
			.setTitle(
				'╔═<:keycapsBag:755519849345843240>═☩Item Shop☩═<:keycapsBag:755519849345843240>═╗',
			)
			.setThumbnail(
				'https://mechakeys.robolab.io/discord/media/pokemon/shopkeep.png',
			)
			.setColor('#ffaf24');

		await interaction.editReply({ embeds: [storeEmbed] });
	},
};
