const { exec } = require("child_process");
const { SlashCommandBuilder } = require("discord.js");

function bashReturn(output) {
  return `\`\`\`Bash\n${output}\n\`\`\``
}

module.exports = {
  alias: ['exec'],
  data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription("Execute a bash command")
    .addStringOption(option => 
      option.setName("command")
        .setDescription("The command to execute")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("command");
    if (!code) {
      return interaction.reply("Oh");
    }

    await interaction.deferReply();

    exec(code, (error, stdout, stderr) => {
      const input = bashReturn(code)
      if (error) {
        let output = bashReturn(error)
        interaction.editReply(input + output);
      } else {
        const output = stderr || stdout;
        const output2 = bashReturn(output)
        interaction.editReply(input + output2);
      }
    })
  }
}