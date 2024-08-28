const { EmbedBuilder } = require("discord.js");
const util = require("util");
const { SlashCommandBuilder } = require("discord.js");

function clean(text) {
  if (typeof text === "string") {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  } else { return text };
}

function evalEmbed(code, output) {
  return new EmbedBuilder()
    .setColor("#FFFFFF")
    .addFields(
      { name: ":inbox_tray: Input: ", value: `\`\`\`${code}\`\`\`` },
      { name: ":outbox_tray: Output: ", value: `\`\`\`${clean(output)}\`\`\`` }
    )
}

function sendFile(interaction, output) {
  interaction.followUp({
    content: "Output exceeded 1024 characters. Output will be sent as file", 
    files: [{
      attachment: Buffer.from(output),
      name: "output.txt"
    }]
  })
}

module.exports = {
  alias: ['eval'],
  data: new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Evaluate JavaScript code")
    .addStringOption(option => 
      option.setName("code")
        .setDescription("The code to evaluate")
        .setRequired(true)
    ),

  async execute(interaction) {
    const code = interaction.options.getString("code");
    if (!code) {
      return interaction.reply(`You didn't provide any input.`);
    }

    try {
      const { guild, members, roles, emojis, channels, guilds, users } = interaction.client;

      var evaled = eval(code);
      if (typeof evaled !== "string") evaled = util.inspect(evaled);
      const checkCharLength = clean(evaled);
      if (code === clean(evaled))
        return interaction.reply("The input was the same as the output.");

      const MAX_CHARS = 3 + 2 + checkCharLength.length + 3;
      if (MAX_CHARS > 1023) {
        await interaction.deferReply();
        sendFile(interaction, checkCharLength)
      } else {
        await interaction.reply({ embeds: [evalEmbed(code, evaled)] });
      }
    } catch (err) {
      if (err.message.length > 1023) {
        await interaction.deferReply();
        sendFile(interaction, err.message)
      } else {
        await interaction.reply({ embeds: [evalEmbed(code, err.message)] });
      }
    }
  }
}