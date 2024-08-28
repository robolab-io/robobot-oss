const { MessageEmbed, Message } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 }
const xpBot = require('./../utils/xpBot')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
const commandLimiter = require('./../utils/commandLimiter');
const { messageFromThePast } = require("../utils/events");

// const gameoverEmbed = new MessageEmbed()
//   .setTitle('Game over.')
//   .setColor('#ffc948')
//   .setImage('https://mechakeys.robolab.io/discord/media/tumblebounce/riptumble.gif')
//   // .setFooter('Someone needs to send a tumbleweed emoji within 30 seconds!', 'https://mechakeys.robolab.io/discord/media/alert.png')
//   .setDescription(`The tumbleweed hit the ground and died.`)

// const statsEmbedNoReward = new MessageEmbed()
//   .setTitle('Tumblebounce game stats & rewards.')
//   .setColor('#ffc948')
//   .setDescription(`**This tumblebounce ended with a save. This means that stats were not saved for this! Use the save better, next time!**`)

// async function endGameNoRewards (msg, currentGames) {
//   let tumblebounce = currentGames[msg.channel.id].tumblebounce
//   delete currentGames[msg.channel.id].tumblebounce
//   save_remote_tumbleweed(msg.guild.id, `c_${env}_${msg.channel.id}_tumblebounce`, false)
//   msg.channel.send(gameoverEmbed)

//   await wait(2000)

//   msg.channel.send(statsEmbedNoReward)
// }

module.exports.tumblebounceSave = async (msg, { args, client, currentGames, channelID, developerAPI }) => {

  const save_remote_tumbleweed = async (guildID, key, value) => {
    const saveRes = await axios.post(`${discordAPI}?action=setGuildField&discordID=${guildID}`, {
      guildObject: value,
      guildField: key
    })
    return saveRes
  }

  let inactiveTumblebounceEmbed = new MessageEmbed()
    .setTitle("Tumblebounce is inactive!")
    .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${msg.author.id}>! You can't save a tumbleweed that doesn't even exist yet!`)
    .setColor("2f3136")

    let tumblebounceInAirEmbed = new MessageEmbed()
    .setTitle("Tumbleweed is in the air!")
    .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${msg.author.id}>! This tumbleweed needs to be falling in to use the Flying Fist!`)
    .setColor("2f3136")

    let fakeFallingEmbed = new MessageEmbed()
    .setTitle(`The tumbleweed is coming back down!`)
    .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/Falling.gif`)
    .setColor('#ffc948')
    .setDescription(`
      Hit it back up before it hits the ground!
      To hit the tumbleweed, send any <:tumbleweed:702482059095965706> tumbleweed emoji.
    `)

    // let fakeEmergencyEmbed = new MessageEmbed()
    // .setTitle("UHHH, THE TUMBLEWEED IS ABOUT TO HIT THE GROUND!!!")
    // .setColor('#ff0000')
    // .setDescription(`
    //   Because you used a save, if the game ends now, **NO ONE WILL EARN REWARDS OR STATS FOR THIS TUMBLEBOUNCE. HIT IT!!!!**
    //   To hit the tumbleweed, send any <:tumbleweed:702482059095965706> tumbleweed emoji.
    //   `)
    // .setFooter(`DUDE! HIT IT!!! AAHHHH`, 'https://mechakeys.robolab.io/discord/media/alert.png')

  // This function is so that we don't accidentally break records. The power that the bot can use is capped at 300.
  function scuffedGetRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  // If tumblebounce isn't active, we'll cancel the command.
  if (currentGames[msg.channel.id]) {
  if (!currentGames[msg.channel.id].tumblebounce) {
    msg.channel.send(inactiveTumblebounceEmbed)
    return
    }
  }

  // Get current game state.
  const tumblebounce = currentGames[msg.channel.id].tumblebounce

  if (tumblebounce.needTouch == false) {
    msg.channel.send(tumblebounceInAirEmbed)
    return
  }

  if (commandLimiter(msg)) return
  const userXP = await xpBot.getXP(msg.author.id)
  if (!userXP || userXP.discordXP < xpRequirement.xp) {
    let notEnoughXpEmb = new MessageEmbed()
      .setTitle("Not enough XP!")
      .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${msg.author.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
      .setColor("2f3136")
    return msg.channel.send(notEnoughXpEmb)
  }

  const guild = client.guilds.cache.get(msg.guild.id)
  const authorUser = guild.members.cache.get(msg.author.id)

  if (authorUser.roles.cache.get('939774831220633600')) { authorUser.roles.remove('939774831220633600')}
  else { return msg.reply('you need a Flying Fist in order to save this tumbleweed from falling! Buy one at the `>store`!')}

  // game state: tumble no longer needs to be touched
  tumblebounce.needTouch = false
  let randompower = scuffedGetRandom(10, 150)
  let timeInAir = Math.round(randompower - (randompower * 0.1))
  tumblebounce.return_time = Date.now() + timeInAir * 1000
  save_remote_tumbleweed(msg.guild.id, `c_${env}_${msg.channel.id}_tumblebounce`, tumblebounce)

  // After the save, we will trigger the falling event and send a fake embed to notify users.
  setTimeout(function() {
    currentGames[msg.channel.id].tumblebounce.needTouch = true
    currentGames[msg.channel.id].tumblebounce.needTouchTime = Date.now()
    // console.log(`Setting needTouchTime for save!`,currentGames[msg.channel.id].tumblebounce.needTouchTime)

    msg.channel.send(fakeFallingEmbed)

  }, timeInAir * 1000);

  let savedEmbed = new MessageEmbed()
    .setTitle("Tumbleweed SAVED!")
    .setDescription("Your Flying Fist shoots off your hand and SMACKS that tumbleweed back into space.")
    .setFooter("No one knows when it'll come back, get ready!")
    .setThumbnail('https://mechakeys.robolab.io/discord/media/tumblebounce/GreatHit.gif')
    .setColor("ffc848")

    msg.channel.send(savedEmbed)
  }

// for some reason i cant get this to work on the VS code app lol
// what do you mean it "doesnt work"
// it doesnt open VS Code
// is it because of your browser, maybe you disabled opening links in apps
// it asked "oepn in VS Code?" and i said yeah lol
// man that sounds like a you problem at this point.
// i am a failure i know lmao
// man fuck you AND your pc issues, what the hell do you even do :sob:
// ;(
// sowwi
// huggie :huggie:
// <3
// yo imagine microsoft just looking at this :skull:
// they need this possitivity in their office
// fr tho
// this is gonna get commited to github, IDC
//LOL
