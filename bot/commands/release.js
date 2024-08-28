const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('./../utils/xpBot')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')


module.exports.release = async (msg, { args, client, getMember }) => {  
  const guild = client.guilds.cache.get(msg.guild.id)
  const guildIDs = idKey[msg.guild.id]
  // check if user owns pokemon
  let pokemon_discord_id = getMember(args[0])
  let pokemon_discord_obj = await axios.get(`${discordAPI}?action=getUser&discordID=${pokemon_discord_id}`).catch(e => {console.error(e); return false;})
  if (!pokemon_discord_obj || !pokemon_discord_obj.data || !pokemon_discord_obj.data.success) { return msg.channel.send(`<@${msg.author.id}>, something went wrong!`) }  

  let didntCaughtEmb = new MessageEmbed()
      .setTitle("You haven't caught that Pokemon!")
      .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${msg.author.id}>, you can't release Pokemon you haven't caught!`)
      .setColor("2f3136")
  if (pokemon_discord_obj.data.data.pokeOwner !== msg.author.id) { return msg.channel.send(didntCaughtEmb) }

  // release pokemon
  const releaseRes = await axios.get(discordAPI + `?action=updateField&discordID=${pokemon_discord_id}&field=pokeOwner&value=wild`)
  // console.log(releaseRes)
  // refund one pokeball to user
  let add_ball = await axios.get(`${discordAPI}?action=incrementField&discordID=${msg.author.id}&field=pokeballCount&key=big_butt`)
  let releaseEmb = new MessageEmbed()
      .setTitle("You released a Pokemon!")
      .setDescription(`"Bye-bye", <@${msg.author.id}> says as they release <@${pokemon_discord_id}> to the wild!`)
      .setColor("2f3136")
  return msg.channel.send(releaseEmb)
}
