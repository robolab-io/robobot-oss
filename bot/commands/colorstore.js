const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('../utils/xpBot')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
const commandLimiter = require('../utils/commandLimiter')
const store_greetings = [
  `Ahaha yes! Welcome to my color store!`,
  'Come on in! We love colors here!',
  'It\'s looking fabulous in here!',
  'Time for a makeover? You look hideous!',
  'Yes, I sell colors now. Times are hard!',
  'Expensive doesn\'t mean better!',
  'Come on in and buy a color! It\'s fun!'
]
module.exports.rolestore = async (msg, { args, client, getMember }) => {
  if (commandLimiter(msg)) return
  // check xp requirement
  const userXP = await xpBot.getXP(msg.author.id)
  if (!userXP || userXP.discordXP < xpRequirement.xp) {
    return msg.channel.send(`Sorry, <@${msg.author.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
  }
  // TODO: Dynamic store?
  let store_flavor = store_greetings[Math.floor(Math.random() * store_greetings.length)];
  let description = `
  ${store_flavor}

  To buy, do \`>buy colorname\`.
  Remember, you can only have one color at a time! Buying overwrites other colors you bought, and you will have to re-buy!

  ╚════════════════════╝
  `
  let emb = new MessageEmbed()  
  .setDescription(description)
  .setImage('https://mechakeys.robolab.io/discord/media/store/rolecolors.png')
  .setTitle(`╔═<:keycapsBag:755519849345843240>Color Shop☩═<:keycapsBag:755519849345843240>═╗`)
  .setFooter('Example: >buy axios green')
  .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/shopkeep.png`)
  .setColor('#ffaf24')
  msg.channel.send(emb)  
}
