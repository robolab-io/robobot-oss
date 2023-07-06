const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const {TOKEN} = require('robo-bot-utils')
const SERVER_ID = '462274708499595264';
const CLIENT_ID = '747491742214783117';

const commands = [];
const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./bot/commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), { body: commands })
	.then(() => console.log('slash commands registered'))
	.catch(console.error);