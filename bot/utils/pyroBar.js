const { isDev } = require("robo-bot-utils")
const env = isDev ? 'staging' : 'production'

const { SERVER_ID } = require('../ids')

const min_xp = 0;
const max_xp = 200;

function getPercentProgress(prev_xp, curr_xp, next_xp) {
	const percent_progress = Math.min(99.9, Math.floor(((curr_xp - prev_xp) / (next_xp - prev_xp)) * 100))
	return percent_progress
}

function generateBarString(prev_xp, curr_xp, next_xp, number_of_slots = 5) {
	// TODO: tech debt with Math.min(99.9), idk how to fix the 100% issue
	const percent_progress = getPercentProgress(prev_xp, curr_xp, next_xp)

	let percent_string = ''

	const orb_map = {
		0: '<:Orbdeadchat:882629585513115700>',
		1:'<:Orb1:882498580261257246>',
		2:'<a:Chillin_Orb:882629586159013928>',
		3:'<a:Vibe_Orb:882629585991270440>',
		4:'<a:Party_Orb:882629586175795230>',
		5:'<a:Golden_Orb:882629585894780999>',
		6:'<a:Golden_Orb:882629585894780999>',
		7:'<a:Throbbing_Orb:882629586008018995>',
		8:'<a:Kek_Orb:882629586435842119>',
		9:'<a:MegOrbsta:882629585999659088>',
		10:'<a:MAXIMUM_ORB:882634494639763516>',
	};

	const emoji_map = {
		0: '<:slim0:880636470619144213>',
		1:'<:slim1:880654567220596786>',
		2:'<:slim2:880654566775984210>',
		3:'<:slim3:880654567262523482>',
		4:'<:slim4:880654567233183824>',
		5:'<:slim5:880654566738235403>',
		6:'<:slim6:880654567241564200>',
		7:'<:slim7:880654567468056616>',
		8:'<:slim8:880654567170269244>',
		9:'<:slim9:880654567308689459>',
		10: '<:slim10:880636470631739402>',
	};

	const close_emoji_map = {
		7: '<a:slim7close:880818907009679421>',
		8: '<a:slim8close:880818907047407697>',
		9: '<a:slim9closer:882009228510892072>',
	};

	const each_block_owns = 100 / number_of_slots;
	const mini_bar_number = Math.floor(((percent_progress % each_block_owns) / each_block_owns) * 10);

	for (let index = 1; index < number_of_slots + 1; index++) {

		if (index === Math.floor((percent_progress / each_block_owns) + 1)) {
			if (index === number_of_slots) {
				percent_string += close_emoji_map[mini_bar_number] || emoji_map[mini_bar_number] || emoji_map[10];
			}
			else {
				percent_string += emoji_map[mini_bar_number] || emoji_map[10];
			}

		}
		else if (index <= (percent_progress / each_block_owns)) {
			percent_string += emoji_map[10];
		}
		else {
			percent_string += emoji_map[0];
		}
	}


	return `${orb_map[Math.round(percent_progress / 10)] || orb_map[1]}${percent_string}`;
}

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

let clientTimer = 0;
const update_cap = 2;
let last_percentage_in_bar = -100;
let last_channel_update = Date.now();
let last_amount = 0;

const percent_change_threshold = 10;
// on startup, setInterval 1 minute

module.exports = {
	drain(client, channel) {
		if (!client || !client.boosts || !client.boosts[channel]) { return false; }
		client.boosts[channel]--;
		return true;
	},
	onMinute(client, channel) {
		// this.drain(client, channel)

		const prev_xp = min_xp;
		const user_xp = client.boosts ? client.boosts[channel] : 0;
		const next_xp = max_xp;

		const current_percent = getPercentProgress(prev_xp, user_xp, next_xp);
		const percent_difference = Math.abs(current_percent - last_percentage_in_bar);
		console.log('Percent difference:', percent_difference);

		const last_type_time = last_channel_update || 0;
		let type_amount = last_amount || 0;

		const accumulated_raw = (Date.now() - last_type_time) / (0.20 * 3600000); // how many they've generated since last use
		const accumulated = Math.min( // limit to cap
			(Math.floor( // round down to nearest integer
				accumulated_raw,
			)),
			update_cap);

		console.log(timeConversion(((1 - accumulated_raw) * 0.20) * 60 * 60 * 1000) + ' left!');
		console.log((type_amount + accumulated) + ' in quota.');

		// if full quota, just update it unless identical
		if (((type_amount + accumulated) === update_cap) && percent_difference) {
			console.log('Full quota! Gonna use it.');
			/* BLOCK OF CODE */
			type_amount = Math.min((type_amount + accumulated), update_cap) - 1; // minus 1 because we just used it
			if (type_amount < 0) {
				return console.log('Can\'t update RN');
			}
			last_amount = type_amount;
			last_channel_update = Date.now();
			last_percentage_in_bar = current_percent;
			this.updateChannelBar(client, channel);
			/* END BLOCK OF CODE */
			return;
		}

		if (percent_difference < percent_change_threshold) { return console.log('threshold too small');} // change too small
		// if (clientTimer <= 2) { return console.log('threshold too small')}

		/* BLOCK OF CODE */
		type_amount = Math.min((type_amount + accumulated), update_cap) - 1; // minus 1 because we just used it
		if (type_amount < 0) {
			return console.log('Can\'t update RN');
		}
		last_amount = type_amount;
		last_channel_update = Date.now();
		last_percentage_in_bar = current_percent;
		this.updateChannelBar(client, channel);
		/* END BLOCK OF CODE */

	},

	updateChannelBar(client, channel) {
		const guild = client.guilds.cache.get(SERVER_ID);
		const channelObj = guild.channels.cache.get(channel);

		const prev_xp = min_xp;
		const user_xp = client.boosts ? client.boosts[channel] : 0;
		const next_xp = max_xp;

		const percent_string = generateBarString(prev_xp, user_xp, next_xp, 10);

		console.log(client.boosts);
		console.log('SET:', percent_string);
		channelObj.setTopic(percent_string + `(**${this.getMultiplier(client, channel)}x** XP) *This goes up with activity!*`);
		// channelObj.send(Date.now())
		// channelObj.send((percent_string + `(**${this.getMultiplier(client, channel)}x** XP)`))
	},

	checkAndUpdateChannelBar(client, amt, channel) {
		if (clientTimer >= 2) {
			// console.log('Too soon, sorry,')
			return;
		}

		if (clientTimer === 1 && amt < 20) {
			// console.log('Only 1 in the bank doe, and that aint bgi enough')
			return;
		}

		clientTimer++;
		setTimeout(() => {
			clientTimer--;
		}, 1000 * 60 * 5.025); // 5 mins and a few secs

		const guild = client.guilds.cache.get(SERVER_ID);
		const channelObj = guild.channels.cache.get(channel);

		const prev_xp = min_xp;
		const user_xp = client.boosts[channel];
		const next_xp = max_xp;

		const percent_string = generateBarString(prev_xp, user_xp, next_xp, 10);

		console.log(percent_string);
		channelObj.setTopic(percent_string + `(**${this.getMultiplier(client, channel)}x** XP)`);
		console.log('checking...');
		console.log(client.boosts);
	},
	// duration is in minutes
	fillDatBoost(client, amount, channel, duration = 1) {
		if (env === 'staging') {
			// console.log('no boost for staging!')
			return; // prevent double xp
		}

		let modified_amount = amount;
		let modified_duration = duration * 4;

		const clone = this;

		/* safety first*/
		client.boosts = client.boosts || {};
		client.boosts[channel] = client.boosts[channel] || 0;

		/* add amount to channel boost */
		client.boosts[channel] += modified_amount;
		console.log(`Added ${modified_amount} to the bar, for ${modified_duration} minutes. `);
		// clone.checkAndUpdateChannelBar(client, modified_amount, channel)

		setTimeout(function() {
			client.boosts[channel] -= modified_amount;
			// clone.checkAndUpdateChannelBar(client, modified_amount, channel)
		}, modified_duration * 60 * 1000);

	},

	getLilBarThingLol(client, channelID, number_of_slots) {
		if (!client.boosts) { return 'Nothin bro lol';}
		const current_xp = client.boosts[channelID] || 0;
		return generateBarString(min_xp, current_xp, max_xp, number_of_slots);
	},
	getMultiplier(client, channelID) {
		if (!client.boosts) { return 0.5;}
		if (client.boosts[channelID <= 0]) { return 0.5; }
		const multiplier = Math.round(Math.max(1, Math.min(4, (client.boosts[channelID] / (max_xp / 100)) / 25)) * 10) / 10;
		return multiplier;
	},

};
