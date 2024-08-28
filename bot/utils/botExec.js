exports.executeBotCommand = async (client, commandName, channelId, options = {}) => {
  // Find the command
  const command = client.commands.get(commandName);
  if (!command) {
    console.error(`Command "${commandName}" not found.`);
    return;
  }

  // Create a mock interaction
  const channel = await client.channels.fetch(channelId);
  // should prob catch bad channelID
  let replyMessage = null;

  const mockInteraction = {
    __INTERNAL_CMD__: true,
    client,
    guild: channel.guild,
    channel,
    channelId,
    user: client.user,
    commandName,
    options: {
      getString: (name) => options[name],
      getInteger: (name) => options[name],
      getBoolean: (name) => options[name],
      // Add other option types as needed
    },
    reply: async (content) => {
      if (typeof content === 'string') {
        await channel.send(content);
      } else {
        await channel.send(content.content || content.embeds?.[0]);
      }
    },
    deferReply: async () => {
      replyMessage = await channel.send('Command is being processed...');
      this.deferred = true;
    },
    editReply: async (content) => {
      if (replyMessage) {
        await replyMessage.edit({content:'', ...content});
      } else {
        replyMessage = await channel.send(content);
      }
    },
    followUp: async (content) => {
      await channel.send(content);
    },
    // Add other necessary properties/methods of CommandInteraction
  };

  // Execute the command
  try {
    await command.execute(mockInteraction);
    console.log(`Successfully executed command "${commandName}"`);
  } catch (error) {
    console.error(`Error executing command "${commandName}":`, error);
  }
}

