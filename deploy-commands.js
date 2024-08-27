const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

const { TOKEN } = require('robo-bot-utils')

const { SERVER_ID, CLIENT_ID } = require('./bot/ids')

const commands = []
const commandFiles = fs.readdirSync('./bot/commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./bot/commands/${file}`)

  if(command.alias) {
    commands.push(command.data.toJSON())
		let ogName = command.data.name
    for (let a of command.alias) {
      command.data.setName(a)
			command.data.setDescription(`${command.data.description} - alias of /${ogName}`)
      commands.push(command.data.toJSON())
    }
  } else {
    commands.push(command.data.toJSON())
  }
}


const rest = new REST({ version: '9' }).setToken(TOKEN)

// we should only update new/changed cmds

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.')

    const BATCH_SIZE = 10;
    const total_batches = Math.ceil(commands.length / BATCH_SIZE);
    for (let i = 0; i < commands.length; i += BATCH_SIZE) {
      const batch = commands.slice(i, i + BATCH_SIZE);
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID),
        { body: batch },
      );
      console.log(`Registered batch ${i / BATCH_SIZE + 1}/${total_batches}`);
    }

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error('Error refreshing commands:', error)
  }
}

registerCommands()