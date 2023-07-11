
module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (interaction.commandName === "tumblebounce") {
      return;
    }

    try {
      await command.execute(interaction);
      client.channels.cache
        .get("945055759824207962")
        .send(
          `# Interaction executed\n**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\``
        );
    } catch (error) {
      console.error(
        "*********************************************************************************************************************"
      );
      console.error(error);
      console.error(
        "*********************************************************************************************************************"
      );
      client.channels.cache
        .get("945055759824207962")
        .send(
          `# Error while executing interaction\n**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\`\n\n`
        );
      await interaction.editReply({
        content:
          "Something broked when we ran this command! This has been logged. Please try again later.",
        ephemeral: true,
      });
    }
  });
}