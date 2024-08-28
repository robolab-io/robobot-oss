const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('../utils/xpBot')
const pyroBar = require('../utils/pyroBar')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const isBooster = require('../utils/isBooster')
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
const commandLimiter = require('../utils/commandLimiter')
const records = require('../utils/records');
const wait = require('../utils/wait')
let lastUserFight = { }
let userConsecutiveDeathCount = { }

const generateFightMessage = (fighter1, victim1, win) => {
  const fighter = `<@${fighter1}>`
  const victim = `<@${victim1}>`
  const winGifs = [
    `https://media1.tenor.com/images/3fd96f4dcba48de453f2ab3acd657b53/tenor.gif`,
    `https://media1.tenor.com/images/4a6b15b8d111255c77da57c735c79b44/tenor.gif`,
    `https://media1.tenor.com/images/74db8b0b64e8d539aebebfbb2094ae84/tenor.gif`,
    `https://media1.tenor.com/images/47ac5507e827fa6a49a1aff6b070c3eb/tenor.gif`,
  ]

  const loseGifs = [
    `https://media1.tenor.com/images/153b2f1bfd3c595c920ce60f1553c5f7/tenor.gif`,
  ]

  // TODO: Make this bot in config
  if (victim1 === `747491742214783117`) {
    if (win) {
      return winGifs[Math.floor(Math.random() * winGifs.length)]
    } else {
      return loseGifs[Math.floor(Math.random() * loseGifs.length)]
    }
  }

  if (win) {
    return winGifs[Math.floor(Math.random() * winGifs.length)]
  } else {
    return loseGifs[Math.floor(Math.random() * loseGifs.length)]
  }

}

module.exports.bitchslap = async (msg, { args, client, getMember, currentGames }) => {
  let recentFights = [
    "Slow down, you're gonna break a nail!!",
    "Chill out, your hands are red already!",
    "Don't you feel the burn???",
    "My mom is jealous of how much you want to slap!",
    "Go slap a girlfriend!",
    "Go slap a boyfriend!",
    "Reminder to drink some water so you don't get dehydrated while slapping.",
    "My hands are hurting just by looking at your slaps.",
    "Careful, you might slap ME on accident!",
    "Is this slap revenge or just for fun? Either way you gotta chill man",
  ]
  if (commandLimiter(msg)) return
  const guild = client.guilds.cache.get(msg.guild.id)
  const guildIDs = idKey[msg.guild.id]

  let recentFightsEmbed = new MessageEmbed()
    .setColor("2f3136")
    .setAuthor(`Dude, calm down!`, msg.author.avatarURL())
    .setDescription(recentFights[Math.floor(Math.random() * recentFights.length)] + `\n ${lastUserFight[msg.author.id] ? (36000 - (Date.now() - lastUserFight[msg.author.id].time))/1000 : 'Many'} seconds left!`)

  if (lastUserFight[msg.author.id] && (Date.now() - lastUserFight[msg.author.id].time) < 36000) {
    msg.channel.send(recentFightsEmbed)
    return // too soon since last message
  }
  if (currentGames[msg.channel.id]) {
    if (!!currentGames[msg.channel.id].bombsquad) {
      msg.channel.send(`<@${msg.author.id}>... dawg.. there's a BOMB GOING OFF. STOP FIGHTING.`)
      return // fight during bombsquad
    }
  }

  //Embeds
  let ghostFightEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Bitchslapping as a Ghost`, msg.author.avatarURL())
  .setDescription(`<@${msg.author.id}>, you can't bitchslap as a ghost! I mean, you can, but it wouldn't do anything.`)
  let graveyardFightEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Bitchslapping in the Graveyard`, msg.author.avatarURL())
  .setDescription("You can't bitchslapping while you're dead! You can't even move your body, let alone pick up slap someone like a little girl!")

  let xpReqEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Under Level 10`, msg.author.avatarURL())
  .setDescription(`<@${msg.author.id}>, you need to be \`level ${xpRequirement.level}\` to bitchslap!`)

  let noArgsEmb = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Mention Someone!`, msg.author.avatarURL())
  .setDescription("You can't bitchslap nobody! You need to @mention someone in this Discord!")

  if (msg.channel.id === guildIDs.graveyard) {
    return msg.channel.send(graveyardFightEmbed)
  }

  // check xp requirement
  const userXP = await xpBot.getXP(msg.author.id)
  if (!userXP || userXP.discordXP < xpRequirement.xp) {
    return msg.channel.send(xpReqEmbed)
  }
  const authorUser = guild.members.cache.get(msg.author.id)

  if (authorUser.roles.cache.get(guildIDs.Ghost)) {
    return msg.channel.send(ghostFightEmbed)
  }
  //Fallback in case user can talk in other channels
  if (authorUser.roles.cache.get(guildIDs.Dead)) {
    return msg.channel.send(`<@${msg.author.id}>, you're dead!`)
  }
  // No user provided
  if (!args.length) {
    return msg.channel.send(noArgsEmb);
  }


  let prepVictimId = getMember(args[0])
  let mention = `<@!${prepVictimId}>`

  let bodyguardsEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Bodyguards`, msg.author.avatarURL())
  .setDescription(`${mention}'s hired bodyguards pushed you away!\n And you broke a nail in the process. Time for a manicure!`)

  let alreadyDeadEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Can't Bitchslap Dead People!`, msg.author.avatarURL())
  .setDescription(`${mention} is dead! Why would you slap a dead body?`)

  let fightGhostEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Can't Bitchslap Ghosts!`, msg.author.avatarURL())
  .setDescription(`${mention} is a ghost! Your slap would just make ghastly air swirl around!`)

  const wouldBeVictim = guild.members.cache.get(prepVictimId)
  if (!wouldBeVictim) {
    return msg.channel.send(noArgsEmb)
  }
  // if victim has bodyguards
  if (wouldBeVictim.roles.cache.get('811255216128786503')) {
    return msg.channel.send(bodyguardsEmbed)
  }
  if (wouldBeVictim.roles.cache.get(guildIDs.Dead)) {
    return msg.channel.send(alreadyDeadEmbed)
  }
  if (wouldBeVictim.roles.cache.get(guildIDs.Ghost)) {
    return msg.channel.send(fightGhostEmbed)
  }

  // let wouldBeVictimXP = await xpBot.getXP(prepVictimId)
  // if (!wouldBeVictimXP || wouldBeVictimXP.discordXP < 1700) {
  //   return msg.channel.send(xpVictimEmbed)
  // }

  // slapper discord
  let slapper_discord_obj = await axios.get(`${discordAPI}?action=getUser&discordID=${msg.author.id}`).catch(e => {console.error(e); return false;})
  if (!slapper_discord_obj  || !slapper_discord_obj.data ||  !slapper_discord_obj.data.success) { return msg.channel.send(`<@${msg.author.id}>, error grabbing your discord data.`) }
  slapper_discord_obj = slapper_discord_obj.data.data
  let notEnoughItemsEmb = new MessageEmbed()
      .setTitle("You don't have any bitchslaps!")
      .setDescription(`<a:red_siren:812813923522183208> <@${msg.author.id}>, you need to buy more Bitchslaps! Check the \`>store\`!`)
      .setColor("2f3136")
  if (!slapper_discord_obj.bitchslapCount) { return msg.channel.send(notEnoughItemsEmb) }

  // deduct ball from slapper
  let deduct_slap = await axios.get(`${discordAPI}?action=deductField&discordID=${msg.author.id}&field=bitchslapCount&key=big_butt`)
  deduct_slap = deduct_slap.data
  if (!deduct_slap.success) {return msg.channel.send(`<@${msg.author.id}>, something went wrong when bitchslapping!`)}

  // Fighter has bodyguards and will now lose them.
  if (authorUser.roles.cache.get('811255216128786503')) { authorUser.roles.remove('811255216128786503')}

  userConsecutiveDeathCount[msg.author.id] = 0 // user just fought, reset their cons death count
  let victim = { discordXP: 0 }

  if (prepVictimId) {
    victim = (await xpBot.getXP(prepVictimId)) || { discordXP: 0 }
  } else {
    return msg.channel.send(noArgsEmb)
  }

  // (victim/fighter)/2
  const fighterXP = userXP.discordXP || 1
  let victimXP = victim.discordXP || 0
  // TODO: role id
  // if (prepVictimId === '747491742214783117') {
  //   victimXP = 10000000
  // }

  const calcWin = (victimXP, fighterXP) => {
    if (prepVictimId === '747491742214783117') {
      if (victimXP > fighterXP) {
        const chance = (((fighterXP + 1)/victimXP) / 2) - 0.005
        return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
      } else {
        const chance = (((victimXP + 1)/fighterXP) / 2) + 0.005
        return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
      }
    }
    if (victimXP > fighterXP) {
      const chance = (((fighterXP + 1)/victimXP) / 2) - 0.25
      return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
    } else {
      const chance = (((victimXP + 1)/fighterXP) / 2) + 0.25
      return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
    }
  }
  const winObject = calcWin(victimXP, fighterXP)
  const win = winObject.win

  // const win = Math.random() > ((victimXP + 1)/fighterXP) / 2
  const chanceToWinPretty = winObject.chance
  const winnerId = win ? msg.author.id : prepVictimId
  const loserId = win ? prepVictimId : msg.author.id
  const loserUsername = client.users.cache.get(loserId)
  let prize = 1
  const xp_function = (chance) => {
    return Math.round(Math.min( Math.max( (10/(chance/100))-8, 2), 10000)) // Minimum of 2, Maximum of 10000
  }

  const boosterMult = isBooster(msg.guild, winnerId) ? 2 : 1
  let footer = winnerId === loserId ? 'You...slapped yourself to death?' : (`${msg.author.username} had a ${chanceToWinPretty}% chance to win!` + ` || ${win ? msg.author.username : wouldBeVictim.user.username} +${prize*boosterMult} XP`)

  let firstemb = new MessageEmbed()
    // .setTitle("You tipped!")
    .setImage(`${generateFightMessage(msg.author.id, prepVictimId, win)}`)
    .setTitle(msg.author.username + ' BITCHSLAPPED ' + wouldBeVictim.user.username + '!')
    .setFooter(footer)
    .setColor(win ? '3eaf7c' : 'da3b3b')
  let secondemb = new MessageEmbed()
    .setTitle(loserUsername.username + ` is now dead!`)
    .setDescription("💀 to stay dead.")
    .setFooter("No praying here! You can only extend this death.")
    .setColor(win ? '3eaf7c' : 'da3b3b')

  if (wouldBeVictim.user.id === '747491742214783117') { secondemb.setThumbnail('https://mechakeys.robolab.io/discord/media/events/falling/angry_robo03.gif') }

  const firstMsg = await msg.channel.send(firstemb)
  const secondMsg = await msg.channel.send(secondemb)
  secondMsg.react('💀')

  // 774088156148400158
  const deadAmount = 10000 // Base milliseconds for bein dead
  const deadStart = Date.now() // Time that dead started
  let deadrole = guild.roles.cache.get(guildIDs.Dead) //Dead role
  let ghostrole = guild.roles.cache.get(guildIDs.Ghost) // Ghost role
  const deadUser = guild.members.cache.get(loserId) // Dead user object
  axios.get(`${discordAPI}?action=incrementField&discordID=${deadUser.id}&field=deathCount&key=big_butt`)
  deadUser.roles.add(deadrole) // Add dead role to user who died
  const graveyard = guild.channels.cache.get(guildIDs.graveyard) // Graveyard channel
  const graveyardMessage = await graveyard.send(`<@${loserId}>, you died from a **bitchslap!** That's embarrassing.`)

  let kekMultiplier = 0 // Milliseconds to extend death timer (extra based on Kek votes)
  let stillDead = true // Interval helper for being ded
  const checker = setInterval(() => {

    // TODO make dynamic
    const kek = secondMsg.reactions.cache.get('💀') || {}
    const kekCount = kek.count || 1
    kekMultiplier = (kekCount - 1) * 120000

    if (Date.now() > deadStart + deadAmount + kekMultiplier ) {
      stillDead = false
      clearInterval(checker)
      deadUser.roles.remove(ghostrole)
      deadUser.roles.remove(deadrole)
      let revivedEmbed = new MessageEmbed()
          .setColor("2f3136")
          .setDescription(`<:bodyguards:816114055030767638> <@${loserId}> **has been resurrected!** <:bodyguards:816114055030767638>`)
      return msg.channel.send(`revived! <@${loserId}>`).then(m => { m.delete(); }) && msg.channel.send(revivedEmbed)
    }
  }, 4506);

  if (prepVictimId === loserId) {
    userConsecutiveDeathCount[loserId] = userConsecutiveDeathCount[loserId] || 1
    userConsecutiveDeathCount[loserId]++
  }
  
  lastUserFight[msg.author.id] = lastUserFight[msg.author.id] || { time: Date.now() }
  lastUserFight[msg.author.id].time = Date.now()
  setTimeout(() => {
    if (prepVictimId === msg.author.id) { return }
    if (win) {
      pyroBar.fillDatBoost(msg.client, 3, '462274708499595266', 10)
      xpBot.giveXP(msg.author, prize, msg.channel, client)
    } else {
      xpBot.giveXP(guild.members.cache.get(prepVictimId), prize, msg.channel, client)
    }
  }, 3000);


}
