const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('./../utils/xpBot')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
let lastUserThrow = { }

const throwGifs = ['normalthrow']
const catchSuccessGifs = ['normalcatch1', 'normalcatch2', 'normalcatch3']
const catchFailGifs = ['normal_fail_1', 'normal_fail_2', 'normal_fail_3']
let pokemon_limit = 5
let pokeTypes = {
  "water": {
    "id": "water",
    "icon": "🌊",
    "strong_against": "fire",
    "weak_against": "plant"
  },
  "fire": {
    "id": "fire",
    "icon": "🔥",
    "strong_against": "plant",
    "weak_against": "water"
  },
  "plant": {
    "id": "plant",
    "icon": "🍃",
    "strong_against": "water",
    "weak_against": "fire"
  },
}

// userA does >capture on userB
// it costs 10 keycaps to do >capture
// userA throws pokeball at userB, does math based on levels to see if capture succeeds
// same as fight command, then HALF the chance after that.
// a dead user being >captured takes away the half'd chance penalty
// upon capture, that user is now the userA's pokemon!

// add to discordDB
// primaryKey is discordID, attribute is pokeOwner
// secondaryIndex makes pokeOwner the primary key

// so we can get discordUser to see owner
// and query a discordUser to see all the pokemon they own

// >battle
// userA wants to >battle userB
// upon accept, users choose which pokemon they want to use
// when battle commences they simply fight each other
// upon battle loss, the winner can either accept a random keycap award (1-20 keycaps) OR steal the pokemon he defeated.

module.exports.capture = async (msg, { args, client, getMember }) => {  
  const guild = client.guilds.cache.get(msg.guild.id)
  const guildIDs = idKey[msg.guild.id]
  let penalty = 75 // %chance to penalize capture      
  // too soon since last message
  if (lastUserThrow[msg.author.id] && (Date.now() - lastUserThrow[msg.author.id].time) < 30000) {
    return msg.channel.send(`<@${msg.author.id}>, slow down!`+ `\n ${lastUserThrow[msg.author.id] ? (30000 - (Date.now() - lastUserThrow[msg.author.id].time))/1000 : 'Many'} seconds left!`)
  }

  if (msg.channel.id === guildIDs.graveyard) {
    let catchInGraveYardEmb = new MessageEmbed()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`But you remember that you're in the fucking underworld, how do you even GET Pokeballs?`)
        .setColor("2f3136")
    return msg.channel.send(catchInGraveYardEmb)
  }

  // check xp requirement
  const userXP = await xpBot.getXP(msg.author.id)
  if (!userXP || userXP.discordXP < xpRequirement.xp) {
    let notEnoughXpEmb = new MessageEmbed()
        .setTitle("Not enough XP!")
        .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${msg.author.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
        .setColor("2f3136")
    return msg.channel.send(notEnoughXpEmb)
  }

  if (guild.members.cache.get(msg.author.id).roles.cache.get(guildIDs.Ghost)) {
    let isGhostEmb = new MessageEmbed()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, aren't you a ghost? You can't even pick up a Pokeball! Go haunt the server.`)
        .setColor("2f3136")
    return msg.channel.send(isGhostEmb)
  }

  if (guild.members.cache.get(msg.author.id).roles.cache.get(guildIDs.Dead)) {
    let deadEmb = new MessageEmbed()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, aren't you dead? You can't capture Pokemon while dead!`)
        .setColor("2f3136")
    return msg.channel.send(deadEmb)
  }
  // No user provided
  if (!args.length) {
    let noCaptureUserEmb = new MessageEmbed()
        .setTitle("Please @mention someone!")
        .setDescription(`<a:red_siren:812813923522183208> Oops, you need to ping someone to capture them! \`>capture @someone\``)
        .setColor("2f3136")
    return msg.channel.send(noCaptureUserEmb);
  }
  
  let victim_discord_id = getMember(args[0])
  let mentionVictim = `<@!${victim_discord_id}>`

  if (msg.author.id === victim_discord_id) {
    return msg.channel.send(`<@${msg.author.id}> bangs their head against a pokeball and loses one of their last few braincells. `)
  }

  const wouldBeVictim = guild.members.cache.get(victim_discord_id)
  let wouldBeVictimXP = await xpBot.getXP(victim_discord_id)

  if (!wouldBeVictim) {
    let invalidUserEmb = new MessageEmbed()
        .setTitle("Please @mention someone valid!")
        .setDescription(`<a:red_siren:812813923522183208> Sorry, but you can't capture someone that doesn't exist! Mention a valid user.`)
        .setColor("2f3136")
    return msg.channel.send(invalidUserEmb)
  }
  if (wouldBeVictim.roles.cache.get(guildIDs.Dead)) {
    // dead (remove penalty for chance)
    penalty = Math.max(0, Math.min(100, (penalty - 25)))
    // return msg.channel.send(`Stop! Stop! ${mention}'s already dead!`)
  }
  if (wouldBeVictim.roles.cache.get(guildIDs.Ghost)) {
    let ghostbusterEmb = new MessageEmbed()
        .setTitle("You can\'t catch ghosts!")
        .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, you need a ghostbuster for that!`)
        .setColor("2f3136")
    return msg.channel.send(ghostbusterEmb)
  }
  
  // if (!wouldBeVictimXP || wouldBeVictimXP.discordXP < 150) {
  //   return msg.channel.send(`Sorry, <@${msg.author.id}>! You can't fight anyone under \`Level 3\`!`)
  // }

  let victim = { discordXP: 0 }
  
  if (victim_discord_id) {
    victim = (await xpBot.getXP(victim_discord_id)) || { discordXP: 0 }
  } else {
    return msg.channel.send(`Please try an @user on discord!`)
  }
  /* Check Discord DB */
  // thrower discord
  let thrower_discord_obj = await axios.get(`${discordAPI}?action=getUser&discordID=${msg.author.id}`).catch(e => {console.error(e); return false;})
  if (!thrower_discord_obj  || !thrower_discord_obj.data ||  !thrower_discord_obj.data.success) { return msg.channel.send(`<@${msg.author.id}>, error grabbing your discord data.`) }
  thrower_discord_obj = thrower_discord_obj.data.data
  let notEnoughPokeballsEmb = new MessageEmbed()
      .setTitle("You don't have enough Pokeballs!")
      .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, you need to buy more Pokeballs! Check the \`>store\`!`)
      .setColor("2f3136")
  if (!thrower_discord_obj.pokeballCount) { return msg.channel.send(notEnoughPokeballsEmb) }

  // cooldown for throwie
  lastUserThrow[msg.author.id] = lastUserThrow[msg.author.id] || { time: Date.now() }
  lastUserThrow[msg.author.id].time = Date.now()

  // check maximum pokemon check
  let user_pokemon = await axios.get(`${discordAPI}?action=getUserPokemon&discordID=${msg.author.id}`)
  if (user_pokemon.data && user_pokemon.data.success && user_pokemon.data.data.Items && user_pokemon.data.data.Items.length) {
    if (user_pokemon.data.data.Items.length >= pokemon_limit) {
      let maximumPokemonEmb = new MessageEmbed()
          .setTitle("You have the maximum amount of Pokemon!")
          .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, you need to \`>release\` one of your Pokemon to catch another!`)
          .setColor("2f3136")
      return msg.channel.send(maximumPokemonEmb)
    }
  }
  
  // victim discord
  let victim_discord_obj = await axios.get(`${discordAPI}?action=getUser&discordID=${victim_discord_id}`).catch(e => {console.error(e); return false;})
  if (!victim_discord_obj || !victim_discord_obj.data || !victim_discord_obj.data.success) { return msg.channel.send(`<@${msg.author.id}>, something went wrong!`) }
  victim_discord_obj = victim_discord_obj.data.data || {}

  // user already caught
  if (victim_discord_obj.pokeOwner && victim_discord_obj.pokeOwner !== 'wild') {
    if (victim_discord_obj.pokeOwner === msg.author.id) { return msg.channel.send(`<a:red_siren:812813923522183208> <@${msg.author.id}>, that's YOUR pokemon, dumbass!`)}
    let emb = new MessageEmbed()
    .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, that user has already been caught by <@${victim_discord_obj.pokeOwner}>!`)
    .setColor('#cc2114')
    return msg.channel.send(emb)
  }
  // user does not have pokeType, let's decide now.
  if (!victim_discord_obj || !victim_discord_obj.pokeType) {
    const pokeType = Object.values(pokeTypes)[Math.floor(Math.random() * Object.values(pokeTypes).length)].id;
    await axios.get(`${discordAPI}?action=updateField&discordID=${victim_discord_id}&field=pokeType&value=${pokeType}`)
    victim_discord_obj.pokeType = pokeType
  }

  // deduct ball from thrower
  let deduct_ball = await axios.get(`${discordAPI}?action=deductField&discordID=${msg.author.id}&field=pokeballCount&key=big_butt`)
  deduct_ball = deduct_ball.data
  if (!deduct_ball.success) {return msg.channel.send(`<@${msg.author.id}>, something went wrong when using a pokeball!`)}

  // (victim/fighter)/2
  const fighterXP = userXP.discordXP || 1
  let victimXP = victim.discordXP || 0

  const calcWin = (victimXP, fighterXP) => {
      if (victimXP > fighterXP) {
        const chance = (((fighterXP + 1)/victimXP) / 2) - ((((fighterXP + 1)/victimXP) / 2) * (penalty/100))
        
        return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
      } else {
        const chance = (((victimXP + 1)/fighterXP) / 2) + ((((victimXP + 1)/fighterXP) / 2) * (penalty/100))
        
        return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
      }
  }

  const winObject = calcWin(victimXP, fighterXP)
  const win = winObject.win
  // const win = Math.random() > ((victimXP + 1)/fighterXP) / 2
  const chanceToWinPretty = winObject.chance
  const winnerId = win ? msg.author.id : victim_discord_id
  const loserId = win ? victim_discord_id : msg.author.id
  if (win) { await axios.get(`${discordAPI}?action=updateField&discordID=${victim_discord_id}&field=pokeOwner&value=${msg.author.id}`) }

  let throw_footer = (`This costs one pokeball!`)

  let emb = new MessageEmbed()
    .setDescription(`<@${msg.author.id}> is trying to capture ${mentionVictim}!`)
    .setAuthor(msg.author.username + ' threw a pokeball!', msg.author.avatarURL())
    .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${throwGifs[Math.floor(Math.random() * throwGifs.length)]}.gif`)
    
    .setColor('#4ffcff')
    
    // const message = new discord.Message()
    // .content=args[0]
    // message.embed=emb
    // .embeds=emb

  const sent = await msg.channel.send(emb)
  setTimeout(async () => {
    let resultEmb
    if (win) {
      const pokemonStats = `${mentionVictim}'s stats
      ${pokeTypes[victim_discord_obj.pokeType].icon} *Type Pokemon*
      *Level* ${victim.level || 0} // ${victim.discordXP || 0} *XP*
      `
      resultEmb = new MessageEmbed()
      .setDescription(pokemonStats)
      .setAuthor(`${msg.author.username} caught a pokemon!`, msg.author.avatarURL())
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${catchSuccessGifs[Math.floor(Math.random() * catchSuccessGifs.length)]}.gif`)
      .setFooter(`${msg.author.username} had a ${chanceToWinPretty}% chance to catch 'em!`)
      .setColor('3eaf7c')
    } else {
      resultEmb = new MessageEmbed()
      .setDescription(`${mentionVictim} escaped!`)
      .setAuthor(`Catch failed!`, msg.author.avatarURL())
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${catchFailGifs[Math.floor(Math.random() * catchFailGifs.length)]}.gif`)
      .setFooter(`${msg.author.username} had a ${chanceToWinPretty}% chance to catch 'em!`)
      .setColor('da3b3b')
    }
    


  const sent = await msg.channel.send(resultEmb)
  }, 3000);
  // >capture @user
  // Message 1: userA is trying to capture userB!
  // userA has a 45% chance to catch userB...

  // Message 2: userA CAPTURED userB!
  // Now userA can use userB in battles against other pokemon!
  // UserB Stats, XP, Level, Battle Winrate

  // console.log(sent)
  // sent.react('💀').then(() => sent.react('🙏'));
  
  
}
