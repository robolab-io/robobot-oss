const { EmbedBuilder } = require('discord.js');

const { SERVER_ID, ch_general, dev_bot } = require('../ids')
const xpBot = require('../utils/xpBot');
const pyroBar = require('../utils/pyroBar');
const keycapAPI = require('../utils/keycapAPI');

const wait = require('../utils/wait');

// you can make anything happen in this config
const roboEventMap = require('./roboEventMap');



function timeConversion(millisec) {
	let seconds = Math.round(millisec / 1000);
	let minutes = Math.round(millisec / (1000 * 60));
	let hours = Math.round(millisec / (1000 * 60 * 60));
	let days = Math.round(millisec / (1000 * 60 * 60 * 24));

	if (seconds < 60) {
		return seconds + ' seconds';
	}
	else if (minutes < 60) {
		return minutes + ' minutes';
	}
	else if (hours < 24) {
		return hours + ' hours';
	}
	else {
		return days + ' days';
	}
}
async function awardAll(winners, reward, reason) {
	return Promise.all(winners.map((user, i) => keycapAPI.giveKeycaps(user, reward, reason || 'gift')));
}

module.exports = {
	/*
    REQUIRED FIELDS
    guild: guild ID
    discordID: user's discord ID
    roleID: the role's ID
    method: 'add' or 'remove'
  */
	removeRole: async (client, params) => {
		const guildID = params.guild || SERVER_ID; // default to robolab.io
		const guild = client.guilds.cache.get(guildID);
		const discordID = params.discordID;
		const roleID = params.roleID;
		if (!discordID || !roleID) {
			return {
				success: false,
				message: 'Missing required parameter(s).',
			};
		}

		const user = guild.members.cache.get(discordID);
		if (!user) {
			return {
				success: false,
				message: 'User not found.',
			};
		}

		user.roles.remove(roleID);
		return {
			success: true,
			message: 'You did it!',
		};
	},

	messageFromThePast: async (client, params) => {
		const guildID = params.guildID || SERVER_ID; // default to robolab.io
		const guild = client.guilds.cache.get(guildID);
		const userID = params.userID;
		const channelID = params.channelID;
		const channel = guild.channels.cache.get(channelID) || guild.channels.cache.get(ch_general); // default to main in case channel deleted
		const message = params.message;
		let request_time = params.request_time || false;
		request_time = !isNaN(request_time) ? Number(request_time) : request_time;
		channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
		await wait(1000);
		// .then(x => x.delete({timeout:10000}) )
		channel.send('*(channel locked)*! \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n ✨༻✦༺　༻✧༺　༻✦༺✨').then(x => {
			setTimeout(() => x.delete(), 10000);
		});
		channel.send(`<a:red_siren:812813923522183208>\n# ATTENTION:\n <@${userID}> has sent a message from the PAST! ${request_time ? '*(' + timeConversion(Date.now() - request_time) + ' ago!)*' : ''} <a:blue_siren:812813923610132500>`);
		await wait(3000);
		const messageEmbed = new EmbedBuilder()
			.setDescription(`**<@${userID}>**: ${message}`)
			.setColor('2f3136');
		channel.send({ embeds: [messageEmbed] });
		await wait(7000);
		channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: null });
		channel.send('*(channel unlocked)*').then(x => x.delete());
		pyroBar.fillDatBoost(client, 2, ch_general, 5);
		// lock channel
		// send SPACER message to clear chat
		// ATTENTION --
		// send message
		// wait 5 seconds
		// delete spacer message
		// unlock channel
	},
	directMessageUser: async (client, params) => {
		const guildID = params.guildID || SERVER_ID; // default to robolab.io
		const guild = client.guilds.cache.get(guildID);
		const userID = params.userID;
		const user = guild.members.cache.get(userID);
		if (!user) {return true;} // user ain't here boss
		const preset_map = {
			'none': [{
				title: 'Ummm... awkward.',
				text: 'Something, or someone, scheduled to send you a DM but... it got messed up. Sorry. Don\'t blame me, I\'m just the messenger.',
				color: '2f3136',
				icon: 'https://mechakeys.robolab.io/discord/media/sadpepe.gif',
				footer: 'Sadness is only temporary.',
			}],
			'dailydiscord_reminder':
      [
      	{
      		title: 'Your daily reward is ready!',
      		text: `Hiya! You asked me to remind you about your daily reward. Come on over and collect!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Come on! Do /daily and try to win that JACKPOT!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `It's that time again! Come on over and collect!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'I wonder how big the Jackpot is now!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Here's your reminder to do /daily! We're all waiting for you!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'I wonder how big the Jackpot is now!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Another day, another daily! Come get your rewards!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'TIP: Closing your eyes while you do /daily **increases** your chances of winning the jackpot!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Good morning. Or night. I can't keep up! Come do /daily!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'FUN FACT: I truly don\'t know if it is day or night!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Please come do /daily! The alarm in my head won't stop until you do.
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Want to stop getting these messages? Stop collecting /daily! Gotem.',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Ay it's a-me! Robo-bot! /daily is ready!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Pro-tip: I love you.',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Time to collect! /daily is ready!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Only cool kids buy merch from Robo Shop!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Time to collect! /daily is ready!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Also try the /pray command! Secret stuff...',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Time to collect! /daily is ready!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Have you checked the /store in the server?',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Ding ding! Come collect your daily reward!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'You might win that Jackpot today...',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Can you collect this reward and hit a tumbleweed for some XP?
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Hit that tumbleweed as hard as you can fam',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Question: Where do all of these keycaps and XP come from???
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Answer: muh butt lmao',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `/daily is the most used command in the server!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'People just love free stuff, huh.',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Being a higher level means BETTER rewards! Try leveling up!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Level up by chatting or playing mini-games on the server.',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Another day, another /daily.
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Fun Fact: Did you know I cannot die?',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Buying Keycaps in-app gets you the DONATOR discord role!
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'This means DOUBLE XP/KEYCAPS from discord!!!',
      	},
      	{
      		title: 'Your daily reward is ready!',
      		text: `Hang out in #general, weird stuff always happens.
			Link to **#general**: https://discord.com/channels/462274708499595264/462274708499595266
			`,
      		color: '2f3136',
      		icon: 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif',
      		footer: 'Just make sure to /pray to me once in a while...',
      	},
      ],
		};
		const preset_array = preset_map[params.preset];
		const preset = preset_array ? preset_array[Math.floor(Math.random() * preset_array.length)] : false;
		const { title, text, color, footer, icon } = preset ? preset : params.message;
		const serverIcon = 'https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif';
		const msgEmbed = new EmbedBuilder()
			.setColor(color || '2f3136')
			.setTitle(title || 'Message from Robo-bot')
			.setThumbnail(icon || serverIcon)
			.setDescription(`${text || 'That\'s all.'}`)
			.setFooter({ text: `${footer || 'Love, Robo-bot'}`, iconURL: `${icon || serverIcon}` });

		try {
			user.send({ embeds: [msgEmbed] });
		}
		catch (e) {
			console.log(e + 'We cannot send a direct message');
		}
	},
	endGiveaway: async (client, params) => {
		const guildID = params.guildID || SERVER_ID; // default to robolab.io
		const guild = client.guilds.cache.get(guildID);
		const userID = params.userID;
		const message = params.message;
		const winnerCount = params.winners;
		const prizeAmount = params.amount;
		const levelRequirement = params.level;
		const giveawayID = params.giveawayID;
		const channelID = params.channelID;
		const channel = guild.channels.cache.get(channelID) || guild.channels.cache.get(ch_general); // default to main in case channel deleted
		const giveawayMessage = await channel.messages.fetch(giveawayID).catch(e => false);
		const generalChannel = guild.channels.cache.get(ch_general);
		console.log('endGiveaway Received!', params);
		const devChannel = guild.channels.cache.get(dev_bot);
		if (!giveawayMessage) {

			devChannel.send(`A giveaway just ended, but I couldn't find the original message. I guess it was canceled!\n user:${userID} winners:${winnerCount} prize:${prizeAmount} level:${levelRequirement} messageID:${giveawayID}`);
			return;
		}
		console.log(giveawayMessage);
		console.log('giveawayMessage');
		// let userPool = await fetchAll.reactions(giveawayMessage, {
		//   userOnly: false, // Only return users that have reacted to the message
		//   botOnly: false, // Only return bots that have reacted to the message
		// });

		const reaction = giveawayMessage.reactions.cache.get('796922161847468043'); // robo_ascended emoji
		console.log(reaction);
		console.log('reaction');
		// let userPool = await getReactedUsers(giveawayMessage, channelID, giveawayMessage.id, '842796636174549011')
		let userPool = (await reaction.users.fetch({ limit: 100 }));
		console.log(userPool);
		console.log('userPool');

		// eslint-disable-next-line no-shadow
		const chooseWinners = async (userPool, winnerCount, currentWinners, levelRequirement) => {
			console.log(userPool, winnerCount, currentWinners, typeof levelRequirement);

			let updatedUserPool = [...userPool];
			if (!updatedUserPool.length) { return currentWinners; }
			let updatedCurrentWinners = [...currentWinners];
			const randomIndex = Math.floor(Math.random() * updatedUserPool.length);
			// devChannel.send(updatedUserPool); // NOTE: idk maybe make it a dev-mode only msg...
			const candidate = updatedUserPool.splice(randomIndex, 1)[0][0];
			// devChannel.send(candidate);
			console.log('candidate', candidate);
			const candidateXP = await xpBot.getXP(candidate);

			// check level req
			console.log(candidateXP);
			if (!candidateXP || candidateXP.level < levelRequirement) {
				console.log('User didn\'t meet level req');
				return await chooseWinners(updatedUserPool, winnerCount, updatedCurrentWinners, levelRequirement);
			}
			console.log('User DID meet level req');
			// add valid winner
			updatedCurrentWinners.push(candidate);

			// if reached amount
			if (updatedCurrentWinners.length < winnerCount) {
				return await chooseWinners(updatedUserPool, winnerCount, updatedCurrentWinners, levelRequirement);
			}
			return updatedCurrentWinners;
		};

		const the_winners = await chooseWinners(userPool, winnerCount, [], levelRequirement);

		console.log('The winners are', the_winners);
		awardAll(the_winners, prizeAmount, 'giveaway');
		const winnerString = `${the_winners.map(x => `<@${x}>`).join(', ')}`;
		// const userXP = await xpBot.getXP(msg.author.id)
		// if (!userXP || userXP.discordXP < xpRequirement.xp) {
		//   return msg.channel.send(xpReqEmbed)
		// }

		// check for giveawayID (messageID in giveaway channel) if doesn't exist, cancel giveaway
		// if exists, get all reactions we care about
		// choose a winner, remove from pool check level
		// if meet level, choose winner
		// if not, repeat until valid winner found
		// if haven't found amount, repeat

		// if the array is somehow empty after checking... no one met requirements... giveaway failed. show message.
		let endText = '';
		if (the_winners.length === winnerCount) { endText = '🎉 Congratulations!'; }
		if (winnerCount > 10) { endText += '\n <:robo_ascend:842796636174549011> That\'s a lot of winners!'; }
		if (prizeAmount > 999) { endText += '\n <:robo_ascend:842796636174549011> That\'s a TON of <:minikeycap:811257663194660876>keycaps!!!'; }
		if (the_winners.length === 0) { endText = '<:robo_angry:842796702494228530> No one won!? WHAT!'; }
		else if (the_winners.length < winnerCount) {
			endText += `\n <:cute_robo_broked:816198206718738442> Huh... it looks like we could only find ${the_winners.length} out of ${winnerCount}... I'll just put those extra keycaps in my pocket!`;
		}
		const pinger = await channel.send(`You won a giveaway! ${winnerString}`);
		pinger.delete();

		const messageEmbed = new EmbedBuilder()
			.setDescription(`🎉 **<@${userID}>'s giveaway has ended!**

				**Winners**: ${winnerString}
				**Prize**: <:minikeycap:811257663194660876>${prizeAmount}
				${endText}
      `)
			.setThumbnail('https://mechakeys.robolab.io/discord/media/tip/gift1.gif')
			.setColor('3dffb1');
		generalChannel.send({ embeds: [messageEmbed] })
		return channel.send({ embeds: [messageEmbed] })
	},

	/* fully dynamic config based events */
	// TODO: make these randomly triggered by /pray @Robo-bot and /fight @Robo-bot along with instant events
	roboEvent: async (client, params) => {
		const { channelID, eventType, delay } = params;
		const guildID = params.guildID || SERVER_ID; // default to robolab.io
		const guild = client.guilds.cache.get(guildID);

    const channel = guild.channels.cache.get(channelID || ch_general)
		console.log('EVENT LOG:', eventType, channelID, channel)

		const eventMappingOverrides = params.eventMappingOverrides || {}; // override specifics here, such as max claimers, or anything in roboEventObject
		let roboEventObject = {
			guild, channel, client,
			startTime: Date.now(),
			active: true, acceptClaimers: false, ending: false,
			claimers: [],
			activeUsers: [],
			preWatchTrigger: function(evO) { // Runs when preWatch starts
				if (evO.eventPreWatchTrigger) { evO.eventPreWatchTrigger(evO); }
			},
			startTrigger: async function(evO) { // Runs preWatch ends and claiming starts
				evO.channel.setRateLimitPerUser(3);
				if (evO.eventStartTrigger) { await evO.eventStartTrigger(evO); }
				return evO.acceptClaimers = true;
			},
			msgTrigger: function(msg, evO) { // Runs on every message while started
				if (!evO.acceptedResponses.map(x => x.toLowerCase().replace(/[^0-9a-z]/gi, '')).includes(msg.content.toLowerCase().replace(/[^0-9a-z]/gi, ''))) return;
				if (!evO.acceptClaimers) return;
				if (evO.claimers.includes(msg.author.id)) return;
				evO.claimers.push(msg.author.id);
				if (evO.eventMsgTrigger) { evO.eventMsgTrigger(msg, evO); }
				if (evO.claimers.length >= evO.maxClaimers) { evO.endTrigger(evO); }
			},
			endTrigger: function(evO) {
				if (evO.ending) { return; }
				evO.ending = true;
				evO.acceptClaimers = false;
				evO.channel.setRateLimitPerUser(0);
				if (evO.eventEndTrigger) { evO.eventEndTrigger(evO); }
				evO.active = false;
				console.log('ENDED!');
			},
		};
		let freshMapping = {}; // welcome
		Object.assign(freshMapping, roboEventMap[eventType]); // to
		Object.assign(freshMapping, eventMappingOverrides); // robo
		Object.assign(roboEventObject, freshMapping); // lab

		if (roboEventObject.addPrewatchTime) {
			roboEventObject.preWatchTime = roboEventObject.preWatchTime + roboEventObject.addPrewatchTime;
		}

		if (!(!client.robo_events[channel.id] || !client.robo_events[channel.id].active)) {
			// TODO: make event queue so we don't just throw out events like cavemen
			// client.robo_events[channel.id].promptChannelQueue = client.robo_events[channel.id].promptChannelQueue || []
			// client.robo_events[channel.id].promptChannelQueue.push(roboEventObject)
			return;
		}

		// TODO: if from remote event, delay randomly from 10-30 seconds to avoid clashing with other remote events
		client.robo_events[channel.id] = roboEventObject;

		// don't accept claimers in preWatch time (to gather active users)
		if (roboEventObject.preWatchTrigger) { roboEventObject.preWatchTrigger(roboEventObject); }
		setTimeout(() => {
			if (roboEventObject.startTrigger) { roboEventObject.startTrigger(roboEventObject); }
		}, roboEventObject.preWatchTime);

		// end game after timeout
		setTimeout(() => {
			roboEventObject.endTrigger(roboEventObject);
		}, roboEventObject.preWatchTime + roboEventObject.prePromptTime + roboEventObject.prePromptRandomMS + roboEventObject.maxTime);


		// Send message to channel with prompt
		// if PrewatchTime, collect "activeUsers"
		// Listen for keyword
		//
		// After delay, stop listening, and trigger finalAction
		// Done, set active to false
	},
};
