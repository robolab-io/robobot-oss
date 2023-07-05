const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const SERVER_ID = '462274708499595264';
const CLIENT_ID = '747491742214783117';

const { creds } = require('./creds.json');
const env = process.env.env || 'staging'; // production or staging
const TOKEN = env === 'production' ? process.env.PROD_TOKEN : process.env.STAGING_TOKEN;

const commands = [];
const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./bot/commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(creds.token || TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), { body: commands })
	.then(() => console.log('slash commands registered'))
	.catch(console.error);