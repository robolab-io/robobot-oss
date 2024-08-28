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


/***   Vanilla CMD Update   ***/
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();



/***   CHUNK REGISTRATION   ***/
/* async function registerCommands() {
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
*/




/***   DIFF REGISTRATION   ***/
/* const getExistingCommands = () => rest.get(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID)).catch(() => []);
const commandsEqual = (cmd1, cmd2) => JSON.stringify(cmd1) === JSON.stringify(cmd2);

async function updateCommands() {
  try {
    const existingCommands = await getExistingCommands();
    console.log(`Existing Total: ${existingCommands.length}, New Total: ${commands.length}`);

    const [toUpdate, toCreate] = commands.reduce((acc, newCmd) => {
      const existingCmd = existingCommands.find(cmd => cmd.name === newCmd.name);
      if (existingCmd && !commandsEqual(newCmd, existingCmd)) {
        // Update Existing
        acc[0].push({ ...newCmd, id: existingCmd.id });
      } else if (!existingCmd) {
        // Create New
        acc[1].push(newCmd);
      }
      return acc;
    }, [[], []]);

    console.log(`To update: ${toUpdate.length}, To create: ${toCreate.length}`);

    if (toCreate.length) {
      console.log('Creating New CMDs.');
      try {
        rest.put(Routes.applicationGuildCommands(CLIENT_ID, SERVER_ID), { body: toCreate })
          .then(() => console.log('slash commands registered'))
          .catch(console.error);
      } catch (err) {
        console.error(err)
      }
      
      console.log('New CMDs created successfully.');
    }

    if (toUpdate.length) {
      console.log('Updating Old CMDs.');
      await Promise.all(toUpdate.map(cmd =>{
        return rest.patch(Routes.applicationGuildCommand(CLIENT_ID, SERVER_ID, cmd.id), { body: cmd })
      }));
      console.log('Old CMDs updated successfully.');
    }

    console.log('Command update completed.');
  } catch (error) {
    console.error('Error updating commands:', error);
  }
}


// Use this if you're running this script directly
updateCommands().then(() => console.log('All operations completed.'));
 */