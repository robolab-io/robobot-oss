const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('./../utils/xpBot')
const pyroBar = require('./../utils/pyroBar')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const isBooster = require('../utils/isBooster')
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
const commandLimiter = require('./../utils/commandLimiter')
const records = require('../utils/records');
const wait = require('../utils/wait')
let lastUserFight = { }
let userConsecutiveDeathCount = { }

const generateFightMessage = (fighter1, victim1, win) => {
  const fighter = `<@${fighter1}>`
  const victim = `<@${victim1}>`
  const winGifs = [
    `https://media1.tenor.com/images/5237f4838c5786ea3d3fd0276d7fd46b/tenor.gif`,
    `https://media1.tenor.com/images/b55aace72003e3fa100c208c8fefe250/tenor.gif`,
    `https://media1.tenor.com/images/d14969a21a96ec46f61770c50fccf24f/tenor.gif`,
    `https://media1.tenor.com/images/514b5ebea579416c0bcc28370184d6dd/tenor.gif`,
    `https://media1.tenor.com/images/3c95ca85f89068660becde7a31f0f04d/tenor.gif`,
    `https://media1.tenor.com/images/9d069ae25a01d92d62666ead2d84a0ed/tenor.gif`,
    `https://media1.tenor.com/images/ee3f2a6939a68df9563a7374f131fd96/tenor.gif`,
    `https://media1.tenor.com/images/fa2614e3f1bc91c212aee25cb1cadbe8/tenor.gif`,
    `https://media1.tenor.com/images/cb8bcd7c0d6c46fa8203a3c4edcb0ad7/tenor.gif`,
    `https://media1.tenor.com/images/175cf269b6df62b75a5d25a0ed45e954/tenor.gif`,
    `https://media1.tenor.com/images/e3a7b35927adda8167131a534553ac6d/tenor.gif`,
    `https://media1.tenor.com/images/2e36b49b3d26d1e2fe014e5d4c1dbc75/tenor.gif`,
    `https://media1.tenor.com/images/bfb2e611643bd89d0a02f20633df4566/tenor.gif`,
    `https://c.tenor.com/N88D2aVoSVMAAAAC/anime-fight.gif`,
    `https://c.tenor.com/rjR2Z67erfkAAAAd/death-saitama.gif`,
    `https://cdn.discordapp.com/attachments/751665008869376010/882448857219354624/ezgif.com-video-to-gif.gif`,
  ]

  const loseGifs = [
    `https://media1.tenor.com/images/892772bb2f07802d6dd1d81d8addc495/tenor.gif`,
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

module.exports.superfight = async (msg, { args, client, getMember, currentGames }) => {
  let recentFights = [
    "How many fists of doom do you even have?!? You're like the Jeff Bezos of Doomfisting people!",
    "Jeff Bezos doesn't even abuse people as much as you abuse your fist of doom!",
    "You might break an arm!",
    "Maybe you could.. you know.. start a converstaion with less annoying people",
    "Dude, you already KILLED someone else for so long! You gotta be considerate.",
    "Pass the time by fighting me, Robo-bot, instead!",
    "Why don't you >bitchslap someone instead?",
    "Isn't it time to claim your daily?",
    "hey bud, it might be time to take some anger management classes",
    "You can watch a movie in this time!",
    "You can get a job in this time!",
    "You can buy keycaps in this time!",
    "The fist has to rest sometimes, too.",
    "Don't you care about the fist's feelings?",
    "Lol made you wait, bitch. Fist THIS!!"
  ]
  if (commandLimiter(msg)) return
  const guild = client.guilds.cache.get(msg.guild.id)
  const guildIDs = idKey[msg.guild.id]

  let recentFightsEmbed = new MessageEmbed()
    .setColor("2f3136")
    .setAuthor(`Dude, calm down!`, msg.author.avatarURL())
    .setDescription(recentFights[Math.floor(Math.random() * recentFights.length)] + `\n ${lastUserFight[msg.author.id] ? (3600000 - (Date.now() - lastUserFight[msg.author.id].time))/1000 : 'Many'} seconds left!`)

  if (lastUserFight[msg.author.id] && (Date.now() - lastUserFight[msg.author.id].time) < 3600000) {
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
  .setAuthor(`Superfighting as a Ghost`, msg.author.avatarURL())
  .setDescription(`<@${msg.author.id}>, you can't superfight as a ghost! You can't even wear a Fist of Doom! It would just fall through your ghost hands, or paws, I'm not sure if you're a furry or something. Also even if you weren't a ghost, honestly the Fist of Doom is like a size 10 in Men's. You might be better off getting the \`bitchslapper\` instead.`)
  let graveyardFightEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Superfighting in the Graveyard`, msg.author.avatarURL())
  .setDescription("You can't superfight while you're dead! You can't even move your body, let alone pick up a Fist of Doom!!")

  let xpReqEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Under Level 9`, msg.author.avatarURL())
  .setDescription(`<@${msg.author.id}>, you need to be \`level ${xpRequirement.level}\` to superfight!`)

  let noArgsEmb = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Mention Someone!`, msg.author.avatarURL())
  .setDescription("You can't superfight nobody! You need to @mention someone in this Discord!")

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
  .setDescription(`${mention}'s hired bodyguards pushed you away!\nThey just slipped off the **Fist of Doom** off your hand, lol. They probably bought the bodyguards at the **>store!**`)

  let alreadyDeadEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Can't Superfight Dead People!`, msg.author.avatarURL())
  .setDescription(`${mention} is already dead! Now that's just overkill, bro.`)

  let fightGhostEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setAuthor(`Can't Superfight Ghosts!`, msg.author.avatarURL())
  .setDescription(`${mention} is a ghost! You can't hurt ghosts! Your **Fist of Doom** can't even touch them!`)

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

  // Fighter has bodyguards and will now lose them.
  if (authorUser.roles.cache.get('811255216128786503')) { authorUser.roles.remove('811255216128786503')}
  // Fighter won't have Fist of Doom after this.
  if (authorUser.roles.cache.get('865711992785731614')) { authorUser.roles.remove('865711992785731614')}
  else { return msg.reply('you aren\'t a fister, mister! Buy a fist at the `>store!`')}

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

  const calcWin = (victimXP, fighterXP) => {
    if (prepVictimId === '747491742214783117') {
      if (victimXP > fighterXP) {
        const chance = (((fighterXP + 1)/victimXP) / 2) + 0.005
        return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
      } else {
        const chance = (((victimXP + 1)/fighterXP) / 2) - 0.005
        return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
      }
    }
    if (victimXP > fighterXP) {
      const chance = (((fighterXP + 1)/victimXP) / 2) + 0.25
      return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
    } else {
      const chance = (((victimXP + 1)/fighterXP) / 2) - 0.25
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
  let footer = winnerId === loserId ? 'Bruh...' : (`${msg.author.username} had a ${chanceToWinPretty}%` + ` chance to win || ${win ? msg.author.username : wouldBeVictim.user.username} +${prize*boosterMult} XP`)

  let firstemb = new MessageEmbed()
    // .setTitle("You tipped!")
    .setImage(`${generateFightMessage(msg.author.id, prepVictimId, win)}`)
    .setTitle(msg.author.username + ' SUPERFOUGHT ' + wouldBeVictim.user.username + '!')
    .setFooter(footer)
    .setColor(win ? '3eaf7c' : 'da3b3b')
  let secondemb = new MessageEmbed()
    .setTitle(loserUsername.username + ` is now dead!`)
    .setDescription("💀 to stay dead.")
    .setFooter("No praying here! You can only extend this death.")
    .setColor(win ? '3eaf7c' : 'da3b3b')

  if (wouldBeVictim.user.id === '747491742214783117') { secondemb.setThumbnail('https://mechakeys.robolab.io/discord/media/events/falling/angry_robo03.gif') }
  msg.channel.updateOverwrite(msg.channel.guild.roles.everyone, { SEND_MESSAGES: false })
  await wait(500)
  msg.channel.send(`*(channel locked)*! \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n ✨`).then(x => x.delete({timeout:8000}) )
  await wait(1000)
  const firstMsg = await msg.channel.send(firstemb)
  await wait(2000)
  const secondMsg = await msg.channel.send(secondemb)
  secondMsg.react('💀')
  await wait(5000)
  msg.channel.updateOverwrite(msg.channel.guild.roles.everyone, { SEND_MESSAGES: null })
  msg.channel.send(`*(channel unlocked)*`).then(x => x.delete({timeout:500}) )
  pyroBar.fillDatBoost(msg.client, 5, '462274708499595266', 10)

  // 774088156148400158
  const deadAmount = 300000 // Base milliseconds for bein dead
  const deadStart = Date.now() // Time that dead started
  let deadrole = guild.roles.cache.get(guildIDs.Dead) //Dead role
  let ghostrole = guild.roles.cache.get(guildIDs.Ghost) // Ghost role
  const deadUser = guild.members.cache.get(loserId) // Dead user object
  axios.get(`${discordAPI}?action=incrementField&discordID=${deadUser.id}&field=deathCount&key=big_butt`)
  deadUser.roles.add(deadrole) // Add dead role to user who died
  const graveyard = guild.channels.cache.get(guildIDs.graveyard) // Graveyard channel
  const graveyardMessage = await graveyard.send(`<@${loserId}>, you died from a **superfight!** Holy shit, dude, you're gonna be here for a while. Let's hope a bombsquad happens.`)

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
      xpBot.giveXP(msg.author, prize, msg.channel, client)
    } else {
      xpBot.giveXP(guild.members.cache.get(prepVictimId), prize, msg.channel, client)
    }
  }, 3000);


}
