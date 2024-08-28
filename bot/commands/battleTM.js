const supportThumbnail = 'https://media.discordapp.net/attachments/743978848692994109/814307225069682708/robo-bot-pink-blobby.png';
const { EmbedBuilder } = require("discord.js");
const { betterSwitch } = require("../utils/betterSwitch");

let helpEmbed = () => new EmbedBuilder()
  .setTitle(`╔═════☩TM Info☩═════╗`)
  .addFields({ name: "🌊 Water", value: "`TM03`" })
  .addFields({ name: "🔥 Fire", value: "`Nothing yet... check later!`" })
  .addFields({ name: "🍃 Grass", value: "`Nothing yet... check later!`" })
  .setDescription(`Wanna learn more about the moves your Pokemon can learn? Check the TM case!`)
  .setFooter({ text: "Do >tm [TM] for more information!" })
  .setThumbnail(`https://media.discordapp.net/attachments/860302356918566944/883839297080401970/unknown.png`);

const helpDct = {
  tm03: (interaction) => {
    return new EmbedBuilder()
      .setAuthor({ name: 'TM03 - Water Pulse', iconURL: interaction.user.avatarURL() })
      .addFields({ name: "Type", value: "🌊 Water" })
      .addFields({ name: "Detail", value: `**PP**: 20\n**Power**: 60\n**Accuracy**: 100` });
  },
};

// TM store?
module.exports = {
  //alias: ['battleTM'],
  data: new SlashCommandBuilder()
    .setName('battletm')
    .setDescription('Displays information about TMs')
    .addStringOption(option => option
      .setName('tm')
      .setDescription('The TM you want to learn about')
      .setRequired(false)),
  async execute(interaction) {
    let command = interaction.options.getString('tm') ? interaction.options.getString('tm').toLowerCase() : '';
    command = command ? command : ''; // ensure string for spaced names
    var embed = betterSwitch(helpDct)(helpEmbed)(command, interaction)
      .setThumbnail(`https://media.discordapp.net/attachments/860302356918566944/883839297080401970/unknown.png`)
      .setColor("2D84FB");
    
    await interaction.deferReply();
    return interaction.editReply({ embeds: [embed] });
  }
};
