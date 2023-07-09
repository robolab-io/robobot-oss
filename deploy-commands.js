const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const { TOKEN, isDev } = require('robo-bot-utils');
const SERVER_ID = '462274708499595264';
const CLIENT_ID = isDev ? '752405174722756718' : '747491742214783117';

const commands = [];
const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./bot/commands/${file}`)

  if(command.alias) {
    commands.push(command.data.toJSON());
		let ogName = command.data.name
    for (let a of command.alias) {
      command.data.setName(a)
			command.data.setDescription(`${command.data.description} - alias of /${ogName}`)
      commands.push(command.data.toJSON());
    }
  } else {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

rest.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), { body: commands })
	.then(() => console.log('slash commands registered'))
	.catch(console.error);