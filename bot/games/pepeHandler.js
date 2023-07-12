const { EmbedBuilder } = require('discord.js');
const { getFlavor, pepeGifs } = require("./helpers");

const { discordAPI, isDev } = require("robo-bot-utils");
const env = isDev ? 'staging' : 'production'

const { useGames } = require('./gameState')

const xpBot = require('../utils/xpBot')
const pyroBar = require('../utils/pyroBar')
const keycapAPI = require('../utils/keycapAPI')
const isBooster = require('../utils/isBooster')
const records = require('../utils/records')


var save_remote_secretpepe = async (guildID, key, value) => {
  // console.log('Save Pepe:', guildID, key, value)
  const saveRes = await discordAPI.setGuildField(guildID, {
    guildObject: value,
    guildField: key
  })
  console.log('IDK if this works in prod', saveRes)
  return saveRes
}

function addSubmission(submissionsObj, user) {
  var id = user.id
  submissionsObj[id] = id in submissionsObj ? 0 : submissionsObj[id] + 1
  return submissionsObj
}


module.exports = async (msg) => {
  let currentGames = useGames()
  let secretpepe = currentGames[msg.channelId].secretpepe

  if ((msg.content.match(/</g) || []).length > 1) {
    msg.channel.send('ONE PEPE AT A TIME')
  } else if (msg.content.includes(secretpepe.the_pepe.id)) {
    secretpepe.guesses++
    secretpepe.player_ids = addSubmission(secretpepe.player_ids, msg.author)

    // Get Flavor
    const gameDuration = (Date.now() - secretpepe.startTime) / 1000
    const flavor = getFlavor('secretpepe', 'end_flavor', gameDuration)

    const the_pepe_emoji = `<:${secretpepe.the_pepe.name}:${secretpepe.the_pepe.id}> `.repeat(8)
    msg.channel.send(`🎉 ${the_pepe_emoji} 🎉`)
    const randomPepe = pepeGifs[Math.floor(Math.random() * pepeGifs.length)];
    const boosterNote = isBooster(msg.guild, msg.author.id) ? '(x2)' : ''

    const embed = new EmbedBuilder()
      .setTitle(`🏆 @${msg.author.username} found the secret pepe! 🏆`)
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/pepes/${randomPepe}`)
      .setColor('#498201')
      .setFooter({ 
        text:'To earn keycaps from minigames, you need to link your account with >link username.',
        iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'
      })
      .setDescription(`${flavor} \n
        **Secret Pepe:** ${the_pepe_emoji}
        **Winner:** \`${msg.author.username} 10${boosterNote} keycaps, 50${boosterNote} XP!\`
        **Game Duration:** \`${gameDuration} seconds\`
        **Guesses:** \`${secretpepe.guesses}\`
        **Players:** \`${Object.keys(secretpepe.player_ids).length}\`
      `)
    msg.channel.send(({ embeds: [embed] }))

    const apiHit = keycapAPI.awardKeycaps(msg.guild, msg.author.id, 10, 'secretpepe')
    xpBot.giveXP(msg.author, 50, msg.channel, msg.client)

    save_remote_secretpepe(msg.guild.id, `c_${env}_${msg.channel.id}_secretpepe`, false)

    records.checkRecord(msg.guild.id, `secretpepe`, 'fastestFind', gameDuration, 'less', msg.author.id, msg)
    records.checkRecord(msg.guild.id, `secretpepe`, 'slowestFind', gameDuration, 'greater', msg.author.id, msg)

    discordAPI.incrementField(msg.author.id, { field: 'secretPepesFound' })

    pyroBar.fillDatBoost(msg.client, 10, '462274708499595266', 10)

    // end game
    delete currentGames[msg.channelId].secretpepe
    return
  } else if (msg.content.includes('<')) {
    // msg.react('❌')
    secretpepe.guesses++
    if (!secretpepe.last_save_time) {
      secretpepe.last_save_time = Date.now()
      save_remote_secretpepe(msg.guild.id, `c_${env}_${msg.channel.id}_secretpepe`, secretpepe)
    } else if (secretpepe.last_save_time < Date.now() - 60000) {
      secretpepe.last_save_time = Date.now()
      save_remote_secretpepe(msg.guild.id, `c_${env}_${msg.channel.id}_secretpepe`, secretpepe)
    }

    secretpepe.player_ids = addSubmission(secretpepe.player_ids, msg.author)
  }

  return
}
