const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

const { useGames } = require('../games/gameState')

exports.alias = ['ts']
exports.data = new SlashCommandBuilder()
		.setName('tumblestreak')
		.setDescription('the unpopular tumbleweed game')

exports.execute = async (act) => {
  await act.deferReply()

  let channelID = act.channelId
  let currentGames = useGames()

  if (currentGames[channelID] && currentGames[channelID].tumblestreak) {
    return act.editReply({ content: "Tumblestreak already active!" })
  }

  currentGames[channelID] = currentGames[channelID] || {}
  currentGames[channelID].tumblestreak = {
    streakers: {},
    last: null,
    startTime: new Date().getTime()
  }

  const embed = new EmbedBuilder()
    .setColor('#ffc948')
    .setImage('https://mechakeys.robolab.io/discord/media/newtumblestreak.png')
    .setFooter({text: 'Each user only counts once for a streak, but be careful! You can still ruin it', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`\`@${act.user.username}\` triggered a minigame!`)  
  
  act.editReply({ embeds: [embed] })

}