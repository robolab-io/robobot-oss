const { SlashCommandBuilder } = require("discord.js")
const { EmbedBuilder } = require('discord.js')
const { useGames } = require('../games/gameState')
const commandAccumulator = require("../utils/commandAccumulator")


function getEmotes(matchArr, emojis) {
  // Find all emotes in server that satisfy matchArr strings.
  const pepes = emojis.filter(x => {
    return x.name.match(matchArr.join('|')) && x.available && !x.animated

  })
  return [...pepes]
}


exports.alias = ['sp']
exports.data = new SlashCommandBuilder()
		.setName('secretpepe')
		.setDescription(`the where's waldo of discord, feat. Pepe`)


//emojis
exports.execute = async (act) => {
  await act.deferReply()

  let channelID = act.channelId
  let currentGames = useGames()
  let emojis = act.guild.emojis.cache

  /* Handle new secretPepe game event */
  if (currentGames[channelID] && currentGames[channelID].secretpepe) {
    act.editReply("Secret Pepe already active!")
    return
  }

  const out_of_uses = !(await commandAccumulator(act, 'secretpepe', false, true))
  if (out_of_uses) return

  // Pepe Emote Array
  const newi = getEmotes(['pepe','peepo','pepo'], emojis)

  currentGames[channelID] = currentGames[channelID] || {}
  let secretpepe = {
    the_pepe: newi[Math.floor(Math.random() * newi.length)][1], // random emoji class-obj from Arr
    startTime: new Date().getTime(),
    guesses: 0,
    player_ids: {}
  }
  currentGames[channelID].secretpepe = secretpepe

  console.log(`${act.channel.name} ${secretpepe.the_pepe.name} is the secret pepe...`)
  
  const embed = new EmbedBuilder()
    .setColor('#498201')
    .setImage('https://mechakeys.robolab.io/discord/media/secretpepe.png')
    .setFooter({text:'Only one Pepe allowed per guess!', iconURL:'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`<@${act.user.id}> triggered a minigame!`)

  act.editReply({ embeds: [embed] })
}


