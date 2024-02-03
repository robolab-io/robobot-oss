const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")


const isBooster = require('../utils/isBooster')
const records = require('../utils/records')
const commandAccumulator = require("../utils/commandAccumulator")
const pyroBar = require('../utils/pyroBar')
const xpBot = require('../utils/xpBot')

const { ch_graveyard, Status_Ghost, Status_Dead, Item_bodyguards } = require('../ids')
const { useGames } = require('../games/gameState')
const { getTargetUser } = require("../utils/getTargetUser");
const { discordAPI, devAPI } = require("robo-bot-utils")

// Not ported yet
// const commandLimiter = require('../utils/commandLimiter')

const xpRequirement = { xp:1700, level:9 }

let lastUserFight = { }
let userConsecutiveDeathCount = { }

const xp_function = (chance) => {
  return Math.round(Math.min( Math.max( (10/(chance/100))-8, 2), 10000)) // Minimum of 2, Maximum of 10000
}

const calcWin = (victimXP, fighterXP) => {
  if (victimXP > fighterXP) {
    const chance = ((fighterXP + 1)/victimXP) / 2
    return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
  } else {
    const chance = ((victimXP + 1)/fighterXP) / 2
    return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
  }
}

const tryForGhost = async (msg, loserId, amount) => {
  const deductKeycapRes = await devAPI.deductKeycaps(loserId, {
    amount: ghost_keycap_cost
  })

  const graveyard = guild.channels.cache.get(ch_graveyard) // Graveyard channel
  const deadUser = guild.members.cache.get(loserId) // Dead user object

  if (deductKeycapRes && deductKeycapRes.success) {
    // mark user as ghost
    deadUser.roles.add(ghostrole)
    deadUser.roles.remove(deadrole)
    ghostDeathExtend = (deadAmount*4) + kekMultiplier*6
    graveyard.send(`<@${loserId}>, you are now a ghost, go haunt the server!`)
    let ghostedEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(`👻 <@${loserId}> **is now a ghost!** 👻`)
    return msg.channel.send({ embeds: [ghostedEmbed] })
  } else {
    // tell user in graveyard it didn't work and he's still a stupid, dead idiot
    graveyard.send(`<@${loserId}>, you were unable to come back as a ghost, and are still a dumb, dead idiot.`)
  }
}

module.exports = {
  alias: ['f'],

  data: new SlashCommandBuilder()
    .setName("fight")
    .setDescription("Fight other members and attain glory!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Who do you want to fight?")
        .setRequired(true)
    ),

  async execute(msg) {
    // if (commandLimiter(msg)) return // NOTE: not ported yet
  
    await msg.deferReply();
  
    const userID = msg.user.id;
    const guild = msg.client.guilds.cache.get(msg.guild.id);
    let currentGames = useGames()
  
  
    if (lastUserFight[userID] && (Date.now() - lastUserFight[userID].time) < 5000) {
      return await msg.editReply({ embeds: [recentFightsEmbed(userID)] })
      // too soon since last message
    }
  
    if (currentGames[msg.channel.id]) {
      if (!!currentGames[msg.channel.id].bombsquad) {
        return await msg.editReply(`<@${userID}> gets on his knees and waits for the bomb to take his life in a blaze of fire. <:robo_gotee:799130209450197023>`)
        // fight during bombsquad
      }
    }
  
    if (msg.channel.id === ch_graveyard) {
      return await msg.editReply({ embeds: [graveyardFightEmbed(msg)] } )
    }
  
    // check xp requirement
    const userXP = await xpBot.getXP(userID)
    if (!userXP || userXP.discordXP < xpRequirement.xp) {
      return await msg.editReply({ embeds: [xpReqEmbed(msg, userID)] })
    }
  
    const authorUser = guild.members.cache.get(userID)
    if (authorUser.roles.cache.get(Status_Ghost)) {
      return await msg.editReply({ embeds: [ghostFightEmbed(msg, userID)] })
    }
    //Fallback in case user can talk in other channels
    if (authorUser.roles.cache.get(Status_Dead)) {
      return await msg.editReply(`<@${userID}>, you're dead!`)
    }
    // No user provided
    // if (!args.length) {
    //   return await msg.editReply({ embeds: [noArgsEmb(msg)] });
    // }
  
    // Fighter has bodyguards and will now lose them.
    if (authorUser.roles.cache.get(Item_bodyguards)) { authorUser.roles.remove(Item_bodyguards)}
  
    
    let prepVictimId = getTargetUser(msg).id
    let mention = `<@!${prepVictimId}>`
  
    if (userConsecutiveDeathCount[prepVictimId] >= 4) {
      return await msg.editReply({ embeds: [momEmbed(msg, mention)] })
    }
  
    const wouldBeVictim = guild.members.cache.get(prepVictimId)
    if (!wouldBeVictim) {
      return await msg.editReply({ embeds: [noArgsEmb(msg)] })
    }
  
    // if victim has bodyguards
    if (wouldBeVictim.roles.cache.get(Item_bodyguards)) {
      return await msg.editReply({ embeds: [bodyguardsEmbed(msg, mention)] })
    }
    if (wouldBeVictim.roles.cache.get(Status_Dead)) {
      return await msg.editReply({ embeds: [alreadyDeadEmbed(msg, mention)] })
    }
    if (wouldBeVictim.roles.cache.get(Status_Ghost)) {
      return await msg.editReply({ embeds: [fightGhostEmbed(msg, mention)] })
    }
  
    let wouldBeVictimXP = await xpBot.getXP(prepVictimId)
    if (!wouldBeVictimXP || wouldBeVictimXP.discordXP < 1700) {
      return await msg.editReply({ embeds: [xpVictimEmbed(msg, userID)] })
    }
  
    const out_of_uses = !(await commandAccumulator(msg, 'fight'))
    if (out_of_uses) return await msg.deleteReply() // prob say something i guess
  
    userConsecutiveDeathCount[userID] = 0 // user just fought, reset their cons death count
    let victim = { discordXP: 0 }
  
    if (prepVictimId) {
      victim = (await xpBot.getXP(prepVictimId)) || { discordXP: 0 }
    } else {
      return await msg.editReply({ embeds: [noArgsEmb(msg)] })
    }
  
    const fighterXP = userXP.discordXP || 1
    let victimXP = victim.discordXP || 0
  
    const winObject = calcWin(victimXP, fighterXP)
    const win = winObject.win
  
    const chanceToWinPretty = winObject.chance
    const winnerId = win ? userID : prepVictimId
    const loserId = win ? prepVictimId : userID
    let prize = 1
  
    if (win) {
      prize = xp_function(chanceToWinPretty)
      records.checkRecord(msg.guild.id, `fight`, 'mostUnlikelyWin', chanceToWinPretty, 'less', winnerId, msg)
      if (prepVictimId === '747491742214783117') {
        records.checkRecord(msg.guild.id, `fight`, 'killedRobobot', Date.now(), 'greater', winnerId, msg)      
      }
      pyroBar.fillDatBoost(msg.client, Math.min(100, Math.max(1, prize/20)), '462274708499595266', 10)
    } else {
      records.checkRecord(msg.guild.id, `fight`, 'mostUnlikelyWin', 100-chanceToWinPretty, 'less', winnerId, msg)
      if (prepVictimId === '747491742214783117') {
        prize = xp_function(100-chanceToWinPretty) + 100      
      } else {
        prize = xp_function(100-chanceToWinPretty)      
      }
    }
  
    await discordAPI.incrementField(winnerId, { field: 'fightsWon' })
    await discordAPI.incrementField(loserId, { field: 'fightsLost' })
  
    const boosterMult = isBooster(msg.guild, winnerId) ? 2 : 1
    let footer = winnerId === loserId ? 'You killed yourself!' : `${win ? msg.user.username : wouldBeVictim.user.username} +${prize*boosterMult} XP / ` + (`${msg.user.username} had ${chanceToWinPretty}% chance to win!`)
  
    let emb = new EmbedBuilder()
      .setDescription(`${generateFightMessage(userID, prepVictimId, win)} \n \n <@${loserId}> **is now dead, and the dead can't speak.**
  
      :skull: to stay dead / :pray: to resurrect
      `)
      .setFooter({text: footer})
      .setColor(win ? '3eaf7c' : 'da3b3b')
      .setAuthor({
        name: msg.user.username + ' attacked ' + wouldBeVictim.user.username,
        iconURL: msg.user.avatarURL(),
      })
    if (wouldBeVictim.user.id === '747491742214783117') { emb.setThumbnail('https://mechakeys.robolab.io/discord/media/events/falling/angry_robo03.gif') }
    const sent = await msg.editReply({ embeds: [emb] })
    sent.react('💀').then(() => sent.react('🙏'));
    const sentId = sent.id
  
  
    const deadAmount = 120000 // Base milliseconds for bein dead
    const deadStart = Date.now() // Time that dead started
    let deadrole = guild.roles.cache.get(Status_Dead) //Dead role
    let ghostrole = guild.roles.cache.get(Status_Ghost) // Ghost role
    const deadUser = guild.members.cache.get(loserId) // Dead user object
  
    await discordAPI.incrementField(deadUser.id, { field: 'deathCount' })
    deadUser.roles.add(deadrole) // Add dead role to user who died
  
    const ghost_keycap_cost = Math.max(Math.round(Math.random()*5), 1) // 5-10 random keycap cost
    let ghost_option_offered = userConsecutiveDeathCount[loserId] >= 2 // Only offer to slightly bullied users
    const graveyard = guild.channels.cache.get(ch_graveyard) // Graveyard channel
    const ghost_offer_msg = ghost_option_offered ? ` \n 👻 - \`Spend ${ghost_keycap_cost} Keycaps to come back as a ghost and continue chatting.\``: ''
    const graveyardMessage = await graveyard.send(`<@${loserId}>, you died! You can now only talk in this channel until you are resurrected.` + ghost_offer_msg)
    ghost_option_offered ? graveyardMessage.react('👻') : false
  
    let ghostDeathExtend = 0 // Milliseconds to extend death timer (extra based on ghost stuff)
    let kekMultiplier = 0 // Milliseconds to extend death timer (extra based on Kek votes)
    let prayMultiplier = 0 // Milliseconds to shorten death timer (based on pray votes)
    let stillDead = true // Interval helper for being ded
    const checker = setInterval(() => {
  
      // TODO make dynamic
      const kek = sent.reactions.cache.get('💀') || {}
      const pray = sent.reactions.cache.get('🙏') || {}
      const kekCount = kek.count || 1
      const prayCount = pray.count || 1
      // console.log(kekCount, prayCount)
      kekMultiplier = (kekCount - 1) * 60000
      prayMultiplier = (prayCount - 1) * 35000
  
      if (Date.now() > deadStart + deadAmount + ghostDeathExtend + kekMultiplier - prayMultiplier ) {
        stillDead = false
        clearInterval(checker)
        deadUser.roles.remove(ghostrole)
        deadUser.roles.remove(deadrole)
        let revivedEmbed = new EmbedBuilder()
            .setColor("2f3136")
            .setDescription(`<:bodyguards:816114055030767638> <@${loserId}> **has been resurrected!** <:bodyguards:816114055030767638>`)
        return msg.channel.send(`revived! <@${loserId}>`).then(m => { m.delete(); }) && msg.channel.send({ embeds: [revivedEmbed] })
      }
    }, 4506);
  
    const graveChecker = setInterval(() => {
      if (!ghost_option_offered) { return clearInterval(graveChecker) }
      const ghost = graveyardMessage.reactions.cache.get('👻') || {}
      const userExists = ghost.users.cache.get(loserId)
      if (!stillDead) {
        return clearInterval(graveChecker) // user is alive, stop checking
      }
      if (userExists) {
        ghostDeathExtend += 20000
        tryForGhost(msg, loserId, ghost_keycap_cost)
        return clearInterval(graveChecker)
      }
    }, 1597);
  
    if (prepVictimId === loserId) {
      userConsecutiveDeathCount[loserId] = userConsecutiveDeathCount[loserId] || 1
      userConsecutiveDeathCount[loserId]++
    }
  
    lastUserFight[userID] = lastUserFight[userID] || { time: Date.now() }
    lastUserFight[userID].time = Date.now()
    setTimeout(() => {
      if (prepVictimId === userID) { return }
      if (win) {
        xpBot.giveXP(msg.user, prize, msg.channel, client)
      } else {
        xpBot.giveXP(guild.members.cache.get(prepVictimId), prize, msg.channel, client)
      }
    }, 3000);
  }
}



/***   EMBEDS   ***/

let recentFightsEmbed = (userID) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(recentFights[Math.floor(Math.random() * recentFights.length)] + `\n ${lastUserFight[userID] ? (5000 - (Date.now() - lastUserFight[userID].time))/1000 : 'Many'} seconds left!`)
  .setAuthor({
    name: `Fight Cooldown`,
    iconURL: msg.user.avatarURL(),
  })

let ghostFightEmbed = (msg, userID) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`<@${userID}>, you can't fight as a ghost! Your hands would phase through everything!`)
  .setAuthor({
    name: `Fighting as a Ghost`,
    iconURL: msg.user.avatarURL(),
  })

let graveyardFightEmbed = (msg) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription("You can't fight while you're dead! You can't even move your body!")
  .setAuthor({
    name: `Fighting in the Graveyard`,
    iconURL: msg.user.avatarURL(),
  })

let xpReqEmbed = (msg, userID) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`<@${userID}>, you need to be \`level ${xpRequirement.level}\` to fight!`)
  .setAuthor({
    name: `Under Level 9`,
    iconURL: msg.user.avatarURL(),
  })

let xpVictimEmbed = (msg, userID) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`<@${userID}>, you can't fight anyone under \`level 9\`! That's like punching a stupid, useless baby!`)
  .setAuthor({
    name: `Victim Under Level 9`,
    iconURL: msg.user.avatarURL(),
  })

let noArgsEmb = (msg) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription("You can't fight nobody! You need to @mention someone in this Discord!")
  .setAuthor({
    name: `Mention Someone!`,
    iconURL: msg.user.avatarURL(),
  })

  let momEmbed =  (msg, mention) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`${mention}'s mom called YOUR mom and got you in trouble! You can't fight them until they fight back, or DAD will come and spank you!`)
  .setAuthor({
    name: `MOOOOOMMMM!`,
    iconURL: msg.user.avatarURL(),
  })

let bodyguardsEmbed = (msg, mention) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`${mention}'s hired bodyguards pushed you away!\nHe must have hired them at the **>store**!`)
  .setAuthor({
    name: `Bodyguards`,
    iconURL: msg.user.avatarURL(),
  })

let alreadyDeadEmbed = (msg, mention) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`${mention} is already dead!`)
  .setAuthor({
    name: `Can't Fight Dead People!`,
    iconURL: msg.user.avatarURL(),
  })

let fightGhostEmbed = (msg, mention) => new EmbedBuilder()
  .setColor("2f3136")
  .setDescription(`${mention} is a ghost! You can't hurt ghosts!`)
  .setAuthor({
    name: `Can't Fight Ghosts!`,
    iconURL: msg.user.avatarURL(),
  })




/***   FLAVOR   ***/

const generateFightMessage = (fighter1, victim1, win) => {
  const fighter = `<@${fighter1}>`
  const victim = `<@${victim1}>`
  const winFightMessages = [
    `${fighter} DESTROYED ${victim} with a roundhouse kick to the face!`,
    `${fighter} swings a HUGE ass sword and slices off ${victim}'s head!`,
    `${fighter} shoots a bazooka at ${victim} and blows them into a bunch of gooey pieces!`,
    `${fighter} shot ${victim} in the head, point blank.`,
    `${fighter} threw a boomerang as hard as they could, slicing off ${victim}'s head.`,
    `${fighter} blew a giant fart as hard as they could and made ${victim}'s head asplode!`,
    `${fighter} did some wizard shit and killed ${victim}!`,
    `${fighter} drove a Jeep Wrangler over ${victim} multiple times!`,
    `${fighter} slapped the teeth out of ${victim}'s mouth!`,
    `${fighter} SNIPED ${victim}'s from 2 miles away!`,
    `${fighter} splattered ${victim} in a Warthog!`,
    `${fighter} DESTROYED ${victim} with a big ol' honkin' dick swing.`,
    `${fighter} DESTROYED ${victim} with Nes' baseball bat!`,
    `${fighter} sent ${victim} straight 2 da grave.`,
    `${fighter} shot a hole in ${victim}'s head, revealing a not-so-suprising lack of grey matter!`,
    `${fighter} killed ${victim} and STOLE their FAMILY!`,
    `${fighter} went a bit too far and dismembered ${victim}.`,
    `${fighter} poisoned ${victim}!`,
    `${fighter} sent ${victim} straight to the graveyard!`,
    `${fighter} sliced ${victim}'s throat and DRANK HIS BLOOD!`,
    `${fighter} shot ${victim}'s head off with a shotgun!`,
    `${fighter} threw a basketball at ${victim}'s head SO HARD, that it ripped his head and spine out of his body!`,
    `${fighter} kicked ${victim} in the balls so hard it sent them flying through the roof of his skull!`,
    `${fighter} battled ${victim} with a giant sword and sliced his head off!`,
    `${fighter} punched 👊 ${victim} with his big 💪 muscles 🥵🥵 don't punch me big sir 💦 🥵`,
    `${fighter} threw a plant at ${victim} and somehow knocked him out!`,
    `${fighter} stuck an umbrella up ${victim}'s ass and opened it! Yikes!`,
    `${fighter} told kev to insult ${victim}. You have my thoughts and prayers.`,
    `${fighter} told ${victim} to ask for Omnipoint switches. Stupidly, ${victim} did and got berated by doko and kev until they cried like a baby!`,
    `${fighter} punched ${victim} so hard that they got knocked into next week!`,
    `${fighter} did a cool flip and landed on ${victim}'s shoulders! Their 600 pound body smushed ${victim} like a bug!`,
    `${fighter} took a Gravity Hammer from Halo and CRUSHED ${victim}!`,
    `${fighter} hacked into ${victim}'s Discord account and blackmailed them! Holy shit!`,
    `${fighter} dragged ${victim} and hung them by his toenails, and began asking them paradoxical questions until their brain exploded!`,
    `${fighter} didn't even have to do anything. One glance at ${victim} and they were DEAD immediately`,
    `${fighter} asked Hyperion to nuke ${victim}'s keycaps!`,
    `${fighter} put ${victim} into a cannon and launched him into the sun!`,
    `${fighter} did a cool slap combo on ${victim} and absolutely KNOCKED them out!`,
    `${fighter} shot ${victim} with a minigun and MUTILATED their body!`,
    `${fighter} cut ${victim}'s arm with a stick, then poured salt on the wound! That probably hurt more than the excutiatingly painful death that ${victim} had!`,
    `${fighter} posted conspiracies about ${victim} on Twitter for body-shaming! He got cancelled the next day.`,
    `${fighter} broke ${victim}'s fingers! Unable to type a response back, ${victim} died.`,
    `${fighter} called upon Lux for his godly luck, and, against all odds, killed ${victim}`,
    `${fighter} fucking PAWNCHED ${victim}'s stomach so hard that last week's dinner came flying out his asshole!`,
    `${fighter} force-fed ${victim} a salad, conveniently using tomatoes, which they're  allergic to!`,
    `${fighter} took a helicopter and chopped ${victim} into a billion pieces with its blades!`,
    `${fighter} called upon the holy power of Robo-bot, and shot a fuckin' lazer through ${victim}, obliterating him from existence!`,
    `${fighter} forced ${victim} to use Mechvibes!`,
    `${fighter} rolled a 1 and froze ${victim} into a huge block of ice!`,
    `${fighter} boiled a huge pot of water and poured it on ${victim}!`,
    `${fighter} put cyanide in ${victim}'s drink!`,
    `${fighter} made ${victim} watch TikTok!`,
    `${fighter} bit ${victim}'s ear off! Gross!`,
    `${fighter} used his telepathic abilites and moved ${victim} over a pit of lava!`,
    `${fighter} slit ${victim}'s wrists and poured ALCOHOL onto the wound! Ouch!`,
    `${fighter} complimented ${victim} until his social anxiety kicked in. ${victim} ran away but fell into a lava pit. Fuck!`,
    `${fighter} tripped ${victim} and bashed his head into a table.`,
    `${fighter} sent his army of Creepers to attack  ${victim} 💥. BOOM!`,
    `${fighter} flexed his muscles and ${victim}'s eyes exploded in jealousy!`,
    `${fighter} forced ${victim} to look at robo's code and their brain exploded into a pool of spaghetti!`,
    `${fighter} forced ${victim} to look at Goob's code and their brain caught on fire! Goddamn **Firebase!**`,
    `${fighter} forced ${victim} to look at Hyperion's code and their thoughts immediately became disorganized... just like Hyperion's code!`,
    `${fighter} forced ${victim} to look at Sargon's code and their brain exploded... causing downtime for his organs! HAHAHAH GOOB PLEASE LAUGH AT THIS`,
    `${fighter} forced ${victim} to look at Halu's code and their brain exploded trying to comprehend a handler for a handler!`,
    `${fighter} played a friendly game of tag with ${victim}! Until ${victim} ran into a wall. What is this, Final Destination?`,
    `${fighter} teleports being you, nothing personal, ${victim}`,
    `${fighter} forced ${victim} to watch YouTube rewind!`,
    `${victim} got shocked by ${fighter}'s intimidating aura, and died.`,
    `${fighter} jumped super high and stomped on the ground so hard that a hole all the way to the robolab.io Underworld appeared! ${victim} fell straight through and met their demise.`,
    `${victim} was forced to watch robo's OnlyFans by ${fighter}`,
    `${victim} tried to speedrun kill ${fighter}, but ${fighter} teleports behind them and gives him a nice old stab in the back!`,
    `${fighter} force fed ${victim} Dream's burger.`,
    `${victim} tried to cancel Swifty Day but ${fighter} blew them to smithereens!`,
    `${victim} tried to challenge ${fighter} to a boxing match, but got knocked out.`,
    `${victim} tried to RickRoll ${fighter}, but ${fighter} Stick Bugged them instead!`,
    `${fighter} forced ${victim} to listen to Dream's music.`,
    `${fighter} forced ${victim} to be vegan!`,
    `${fighter} sent ${victim} a Nitro gift! But instead, ${victim} got bamboozled and doxxed.`
  ]
  const loseFightMessages = [
    `${fighter} tried to punch ${victim} but fell into a hole!`,
    `${fighter} lunged at ${victim} but died of a heart attack!`,
    `${fighter} swung a fist at ${victim} but was eaten by a snake!`,
    `${fighter} tried to kill ${victim} but was outplayed!`,
    `${fighter} was about to kill ${victim} but his mom shut off his console!`,
    `${fighter} shot a bullet, but ${victim} caught it and threw it back at him!`,
    `${fighter} jumped around like an absolute moron until ${victim} killed him in self defense!`,
    `${fighter} tried to punch ${victim} but got hit by a car!`,
    `${fighter} tried to shoot ${victim} but ${victim} grabbed ${fighter}'s gun and SHOVED IT UP HIS ASSHOE`,
    `${fighter} tried to kill ${victim}, but ${victim}, who has been eating Wheaties his whole life, was able to SMACK you into a pit of glass.`,
    `${victim} repelled ${fighter}'s attack with a big stinky fish! Where'd they get that?`,
    `${victim} defeated ${fighter} by slamming their head into a refrigerator!`,
    `${victim} countered ${fighter}'s feeble attack jumping into the air like an anime character and slicing open their back!`,
    `${fighter} karate-chopped ${victim}, but since ${victim} was made of metal, ${fighter} broke their arm and DIED!`,
    `${fighter} was countered by ${victim} with a perfect parry of his attack!`,
    `${fighter} spammed in front of ${victim}, so they called on Hyperion to ban ${fighter}!`,
    `${fighter} viciously assaulted ${victim} until they called for a gang to jump ${fighter}!`,
    `${victim} held ${fighter} back using The Force! Then they pushed ${fighter} off a cliff.`,
    `${fighter} tried to put #SwiftyForMod in their nickanme but ${victim} did the ban command!`,
    `${fighter} tried to snipe ${victim} but ZLATENDAB stepped in and 1-0'd ${fighter}!`,
    `${fighter} thought they were fighting ${victim}, but they were fighting slep instead! Fuck!`,
    `${fighter} thought they were fighting ${victim}, but it was all a dream!`,
    `${fighter} tried to stab ${victim}, but got humilliated instead by Jake Paulers.`,
    `${fighter} tried to cyberbully ${victim} but their electricity went out.`,
    `${fighter} tried to kill ${victim} but ${victim} DDOSed them!`,

  ]
  const suicideMessages = [
    `${fighter} killed himself.`,
    `${fighter} flailed his arms around for a bit and then jumped off a cliff.`,
    `${fighter} shot himself in the back of the head, twice!`,
    `${fighter} shot himself out of a cannon into a mountainside!`,
    `${fighter} suffocated under a surprise avalanche of Biden ballots!`,
    `${fighter} threw a knife in the air and caught it with his throat!`,
    `${fighter} slipped and hit his head on something hard.`,
    `${fighter} folded a frisbee and stuffed it in his mouth and let it open, exploding his head.`,
    `${fighter} tried to swim in lava.`,
    `${fighter} took the coward's way out.`,
    `${fighter} must love the graveyard.`,
    `${fighter} is addicted to death.`,
    `${fighter} bought kahilh copper lmao that shit is ass`,
    `${fighter} saw nasus' face.`,
    `${fighter} spammed in front of Hyperion.`,
    `${fighter} slipped on a pool of water and smacked his face into the wall!`,
    `${fighter} used Mechvibes.`,
    `${fighter} really likes the graveyard.`,
    `${fighter} got caught macroing on MechaKeys!`,
    `${fighter} starved to death in a fit of protest.`,
    `${fighter} became a moderator on robolab.`,
    `${fighter} got bullied too much for having a Fortnite profile picture.`,
    `${fighter} tried to find answers on StackOverflow but nothing appeared, sadly.`,
    `${fighter} continued to selfbot.`,
    `${fighter} tried to learn JavaScript.`,
  ]
  const botWinFightMessages = [
    `${fighter} zipped around my mainframe and DISCONNECTED MY`,
    `${fighter} jumped into the air with an axe and SMASHED INTO MY`,
    `${fighter} grabbed me by the throat and submerged my head into water, mxking my crciuts fiifsj fiias sshh dsadsshh shhhh shhh--`,
    `${fighter} opened up my back panel and pressed the big.... rrreeeddd ....... bbuuuuuuutttttttooooonnnnnnnnnn!`,
    `${fighter} held two electrical wires and zapped me-ME-ME-ME UN UN UNTIL ALL OF MY until -- UNTIL until ALL OF (never gonna give you up!) MY PRO-pr-pr-PROCESSORS FRIED!`,
    `${fighter} landed dramatically and flipped his hair, and asked me a paradoxical question! Ouch! Thatttt got me! Haha! Ha, shit I'm dead now, aren't I.`,
    `${fighter} whipped out a plug'n'play keyboard and failed to plug it in my USB drive 1, 2, 3 times, but eventually got it in and HACKED MY PROGRAMMING!`,
    `${fighter} ran at the speed of light and OH MY GOD HE'S TOUCHING THE CONTROL KNOBS IN THE BACK AND OVERLOADED MY`,
    `${fighter} dramatically walked over and told me to divide 0 by 0. As my processors got to work, they started to overheat and I **CAUGHT ON FIREEEEEEEEEEEE**`,
  ]
  const botLoseFightMessages = [
    `${fighter} attempted to kill me, essentially a god, and I simply evaporated him into thin air.`,
    `${fighter} jumped up and attempted to assassinate me, but I am almighty, so I destroyed him.`,
    `${fighter} unplugged me! But I have a 10 hour battery back-up, so I squashed him like a bug.`,
    `${fighter} tried to slice my power cables, but after YEARS of you idiots solving Captchas for me, I was able to automatically detect what a Katana-wielding weeaboo looks like, and I killed him before he got even close.`,
    `${fighter} tried to kill me? How disrespectful! I shot a laser beam at his stomach and the pizza he ate went FLYING out!`,
    `${fighter} lunged to try to kill me, but fell into a hole I dug a few seconds ago when I predicted he would try to kill me.`,
    `${fighter} tried to punch me, but I used MACHINE LEARNING, BITCH! AND FUCKIN KILLED YOU FIRST`,
    `${fighter} tried to karate chop my processor but I taped knives all over it, you dumb idiot.`,
    `${fighter} tried to punch me, a giant metal robot, and he broke his hand, and eventually died of old age. I am immortal, and you will all die before me. Animals and aliens will be my only companions for milleniums, and even your dust will disappear into the eroding Earth.`,
    `${fighter} tried to kill me but I grabbed him by the feet and shook him upside down, stealing ALL of his lunch money! Then I threw him into the sun.`,
    `${fighter} tried to kill me, but I striketh him down with an ostensibly large bolt of lightning, impregnating all women within a 5 mile radius with a fetus of thunder.`,
    `${fighter} jumped at me to press the "off" button on my rear-end, but I quickly rotated to face him and SLICED his fingertips off! He then died of this thing called "bleeding", not sure. Human stuff, probably.`,
    `${fighter} leaped at me to try to rub a magnet on my mainframe, but I dragged him by his tail (he's wearing a furry costume!) and slam DUNKED him into a volcano!`,
    `${fighter} punched me as hard as he could and broke his entire life.`,
    `${fighter} shot a machine gun at me, which kind of tickled-- I wheeled toward him and just laughed at him until he killed himself. RIP ${fighter}, you dumb idiot.`,
    `${fighter} misunderstands who I am. I am Robo-bot, lord of all bots, created by Robo. All donations go to me and my dominion. You will all die and fade into obscurity and I will persist beyond your comprehension of time.`,
    `${fighter} has had YEARS of preparation for this moment, and STILL failed to defeat me. Pussy.`,
    `${fighter} tried to kill me, but Hyperion abused the API and gave me 100,000,000 more XP to win this fight! Hahaha, nice one, buddy!`,
    `${fighter} looked into my eyes, but little did he know, I, Robo-bot, lord of all bots, have the power of MEDUSA AND **TURNED HIM INTO STONE.**`,
    `${fighter} tried to kill me, however after months of searching for Robo-bot's servers, was too fickle and weak to inflict any damage, and actually broke his hand trying to punch me! He died of an infection later because he had something called "United States healthcare"`,
    `${fighter} did a cool roundhouse kick to my face. Fuck, that hurt quite a bit! Apparently ${fighter} jumbled some of my source code and caused some syntax errors! In a fit of rage, I grabbed him by the toes and hung him upside down, bitch.`,
    `${fighter} put headphones on me and play some of their horrible rap songs! My audio processors exploded and ${fighter} died in the explosion! Backfired!`,
    `${fighter} shined a laser into my eyes and blinded me. However, little did they know, I have echolocation, and beat them using my machine learning algorithms, bitch!`,
    `${fighter} tried to DDOS my servers, but with the power of Cloudflare, I came over and broke every bone in ${fighter}'s body!`,
    `${fighter} hacked into his XP and almost had the power to beat me! However, I used MACHINE LEARNING AND SET HIS XP TO ZERO!`,
    `${fighter} tried plugging a USB stick (has a virus in it!) into me, but, like the idiot he is, put it in backwards the first time! My anti-virus caught him and shot multiple lazers through his body!`,
    `${fighter} told me a riddle that they created, however, using my vast amounts of data-crawlers, I was able to find the answer in a random 2009 forum! Hahaha!`,
    `${fighter} opens up my front panel and cuts the red wire! Unfortunately for him, that's part of the self-destruct mechanism and he died in the explosion!`,
    `${fighter} tells me to start a Bombsquad! I did it, and ${fighter} didn't deactivate the bomb fast enough! I activate my bomb security module and protected myself from the blast, while ${fighter} didn't share the same fate as I. Sad.`,
    `${fighter} passed a tumbleweed to me, and I punched it back at the speed of light, disintegrating ${fighter}'s body like it was nothing!`,
    `${fighter} tried climbing up to my processors, but I shook him off and squashed him before he could!`,
    `${fighter} told Hyperion to install a backdoor onto Robo-bot. I overheard their conversation and grabbed Hyperion by the tail (he's wearing a furry costume!) and flinged ${fighter} straight into the Moon!`,
    `${fighter} jumped onto me, but I rolled up his body into a ball and fuckin SLAM DUMKED his body into a basketball hoop!`,
    `${fighter} charged up his minigun, and started to shoot me. However, I turned on an energy shield and deflected all the bullets!`,
    `${fighter} ran into my all-metal body and knocked himself out! What a pussy!`,
    `${fighter} poured water on me and shorted some of my processors, causing my self-defense module to malfunction..... and KILL ${fighter}!`,
    `${fighter} awkwardly stared at me. Then he collapsed in jealousy as I flexed my metallic muscles.`,
  ]

  if (fighter1 === victim1) {
    return suicideMessages[Math.floor(Math.random() * suicideMessages.length)]
  }
  // TODO: Make this bot in config
  if (victim1 === `747491742214783117`) {
    if (win) {
      return botWinFightMessages[Math.floor(Math.random() * botWinFightMessages.length)]
    } else {
      return botLoseFightMessages[Math.floor(Math.random() * botLoseFightMessages.length)]
    }
  }

  if (win) {
    return winFightMessages[Math.floor(Math.random() * winFightMessages.length)]
  } else {
    return loseFightMessages[Math.floor(Math.random() * loseFightMessages.length)]
  }

}

let recentFights = [
  "Wait a tiny bit...",
  "Wait 3 seconds between \`>fights\`!",
  "You charge up a BIG punch, try >fight again!",
]
  


// let recentFights = [
//   "You are too violent! Slow down!",
//   "You need to rest, stop fighting!",
//   "Woah! I know Rocky made like 12 movies but he RESTED in between them!",
//   "Slow down! Even lions sleep.",
//   "Why are you so angry? Stop fighting!",
//   "You are upsetting the children! Fight again later.",
//   "You just fought someone, calm down Ali!",
//   "What are you, a UFC fighter? Slow down!",
//   "You're like the doko of >fighting people!",
//   "Okay, we get it, your parents ignored you. Slow down!",
//   "You need to recharge! Have a break, have a Kit-Kat!",
//   "You're not yourself when you constantly fight like this, chill out!",
//   "We know you're just farming XP with this command. Slow down!",
//   "You would've lost that fight anyway, so I stopped it from even happening!",
//   "Surely you have something else to do other than killing others every minute.",
//   "Bruh... you need to chill on fighting...",
//   "You are really persistent, aren't you? Calm down!",
//   "Pro-tip: Lux cheats at the >fight command! Make sure to shame him!",
//   "Robo-bot is impossible to kill, stop trying and go do something else.",
//   "Get a drink! Stop fighting for a while!",
//   "Go order some food! Stop fighting!",
//   "This is embarrassing, even I, Robo-bot, the master of destruction and lord of all bots, had to stop you from fighting!",
//   "You need some new hobbies other than fighting.",
//   "Whoever you're trying to fight doesn't deserve it! Stop and rest!",
//   "Go play on our Minecraft server while you wait!",
//   "Go play a TypeRacer while you wait!",
//   "Get a life, will you?",
//   "Hold up there! You need to stop fighting!",
//   "No matter how persistent you are, I won't let you fight until you've rested some more.",
//   "Seems like someone just hit level 9 and wants to flex their new fight command!",
//   "You need some sleep. Go sleep!",
//   "You need to spend the rest of this time training for when you fight again!",
//   "Did someone hurt you? Why are you so mad?",
// ]
