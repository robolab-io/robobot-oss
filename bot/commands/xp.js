const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const xpBot = require('./../utils/xpBot');
const { HALU } = require('../ids')

module.exports = {
	alias: ['lvl', 'level'],
	data: new SlashCommandBuilder()
		.setName('xp')
		.setDescription('View someone\'s Discord XP and level')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('The person you want to view')
				.setRequired(false),
		),

	async execute(interaction) {
		await interaction.deferReply();

		let userArgument = interaction.options.getUser('user');
		let userID;
		let userUsername;
		let userAvatar;

		if (userArgument) {
			userID = userArgument.id;
		}
		else {
			userID = interaction.user.id;
		}

		const userXP = await xpBot.getXP(userID);
		console.log('userXP' + JSON.stringify(userXP));
		const userLevel = userXP.level;

		if (!userXP.data) {
			let noXPEmbed = new EmbedBuilder()
				.setDescription(
					`<a:red_siren:812813923522183208> <@${userID}> has no XP.\n**To get XP, you need to be linked and send a couple messages!**`,
				)
				.setColor('2f3136');
			return interaction.editReply({ embeds: [noXPEmbed] });
		}

		const prev_xp = userXP.levelInfo.xp;
		const user_xp = userXP.data.discordXP;
		const next_xp = userXP.next_level.xp;

		const percent_progress = Math.floor(
			((user_xp - prev_xp) / (next_xp - prev_xp)) * 100,
		);
		let percent_string = '';

		const emoji_map = {
			0: '<:slim0:880636470619144213>',
			1: '<:slim1:880654567220596786>',
			2: '<:slim2:880654566775984210>',
			3: '<:slim3:880654567262523482>',
			4: '<:slim4:880654567233183824>',
			5: '<:slim5:880654566738235403>',
			6: '<:slim6:880654567241564200>',
			7: '<:slim7:880654567468056616>',
			8: '<:slim8:880654567170269244>',
			9: '<:slim9:880654567308689459>',
			10: '<:slim10:880636470631739402>',
		};

		const close_emoji_map = {
			7: '<a:slim7close:880818907009679421>',
			8: '<a:slim8close:880818907047407697>',
			9: '<a:slim9closer:882009228510892072>',
		};

		const xp_to_go = next_xp - user_xp;
		let so_close_threshold = '';

		if (percent_progress >= 90) {
			so_close_threshold = `*${xp_to_go} XP left!* <a:goldencaret:880826858885763112>`;
		}

		const number_of_slots = userID === HALU ? 1 : 5;
		const each_block_owns = 100 / number_of_slots;
		const mini_bar_number = Math.floor(
			((percent_progress % each_block_owns) / each_block_owns) * 10,
		);

		for (let index = 1; index < number_of_slots + 1; index++) {
			if (index === Math.floor(percent_progress / each_block_owns + 1)) {
				if (index === number_of_slots) {
					percent_string +=
            close_emoji_map[mini_bar_number] ||
            emoji_map[mini_bar_number] ||
            emoji_map[10];
				}
				else {
					percent_string += emoji_map[mini_bar_number] || emoji_map[10];
				}
			}
			else if (index < percent_progress / each_block_owns) {
				percent_string += emoji_map[10];
			}
			else {
				percent_string += emoji_map[0];
			}
		}

		if (userArgument) {
			userUsername = userArgument.username;
			userAvatar = userArgument.avatarURL();
		}
		else {
			userUsername = interaction.user.username;
			userAvatar = interaction.user.avatarURL();
		}

		const xpEmbed = new EmbedBuilder()
			.setAuthor({ name: userUsername, iconURL: userAvatar })
			.setColor('2f3136')
			.setDescription(
				`\nLevel **${userLevel}**\n**${Math.round(user_xp)
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}** XP\n${percent_string}\n${
					so_close_threshold || ''
				}`,
			)
			.setThumbnail(userXP.levelInfo.thumbnail);

		await interaction.editReply({ embeds: [xpEmbed] });
	},
};
