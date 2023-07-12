const port = process.env.PORT || 3000;
const { EmbedBuilder } = require('discord.js');

const eventMapper = require('./utils/events');
const { SERVER_ID, Role_Linked, ch_general, log_api } = require('./ids')

// let { client } = require('./client') 

module.exports = (app, client) => ({
	init() {
		app.listen(port, () => {
			client.robo_events = {};
			console.log(`Robo-bot listening at http://localhost:${port}`);
		});
	},
	logs() {
		app.get('/log', genericLog(client));
		app.get('/linked', linkLog(client));
		app.post('/event', handleEvent(client));
	}
})

const handleEvent = client => async (req, res) => {

	if (!req || !req.body || !req.body.action) {
		res.send('Invalid route or missing action!');
		return false;
	}
	console.log(req.body);
	console.log('Got req!');
	const eventRes = await eventMapper[req.body.action](client, req.body);

	return res.send('Event handled.');

};

const linkLog = client => (req, res) => {
	if (!req || !req.query || !req.query.id) {
		res.send('Invalid route!');
		return false;
	}
	const userID = req.query.id || false;
	const silent = !!req.query.silent;
	
	const guild = client.guilds.cache.get(SERVER_ID);
	const user = guild.members.cache.get(userID);
	if (!silent) {
		let lastChannel = guild.channels.cache.get(ch_general);
		let apiLogChannel = guild.channels.cache.get(log_api);

		const embed = new EmbedBuilder()
			.setTitle('Account Linked!')
			.setColor('#2f3136')
			.setDescription(`<@${user.id}>, your account has been successfully linked! Send your first message to level up!`);

		const apiLogEmbed = new EmbedBuilder()
			.setTitle('User successfully linked account')
			.setColor('#2f3136')
			.setDescription(`<@${user.id}> successfully linked their MechaKeys account to Discord.`);


		lastChannel.send({ content: `<@${userID}>`, embeds: [embed] }).then(x => setTimeout(() => x.delete(), 20000));
		apiLogChannel.send({ embeds: [apiLogEmbed] });
	}

	let role = guild.roles.cache.get(Role_Linked);
	user.roles.add(role);
	res.send('User notified on discord!');
};


const genericLog = client => (req, res) => {
	if (!req || !req.query || !req.query.user || !req.query.amount) {
		res.send('Missing required params!');
		return false;
	}
	const action = req.query.action || 'unknown';
	const reason = req.query.reason || 'unknown';
	const username = req.query.user;
	const amount = req.query.amount;
	const guild = client.guilds.cache.get(SERVER_ID);
	const channel = guild.channels.cache.get(log_api);
	const embed = new EmbedBuilder()
		.setTitle('User awarded Keycaps!')
		.setThumbnail('https://mechakeys.robolab.io/discord/media/tip/tip4.gif')
		.setColor('#2bffb8')
		.setDescription(`${username} was awarded ${amount} keycaps via the API! \n \`Action: ${action}\` \n\`Reason: ${reason}\``);
	channel.send({ embeds: [embed] });

	res.send('Logged on discord!');
};
