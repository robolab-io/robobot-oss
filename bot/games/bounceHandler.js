const { EmbedBuilder } = require('discord.js')

const { discordAPI, isDev } = require("robo-bot-utils");
const env = isDev ? 'staging' : 'production'

const xpBot = require('../utils/xpBot')
const pyroBar = require('../utils/pyroBar')
const wait = require('../utils/wait')
const isBooster = require('../utils/isBooster');
const records = require('../utils/records');

const { awardAll, getRandom, getFlavor } = require("./helpers");
const { useGames } = require('./gameState')

const validTumbles = [
  "<:tumbleDio:732069094961971212>",
  "<:tumbleFeelsMan:746261316184047636>",
  "<:tumbleweed:702482059095965706>",
  "<:tumbleSleep:749526264473321502>",
  "<:tumblesmoke:852635646400135198>",
  "<:tumblelgbtq:852728924189622302>",
]


var hitEmbed, hitMiniEmbed, fallingEmbed, gameoverEmbed, statsEmbed;
EMBEDS : {
  var hitEmbed = (msg, startTime, powerGif, timeInAir, random, reactionTime) => ({embeds: [new EmbedBuilder()
    .setTitle(`@${msg.author.username} hit the tumbleweed!`)
    .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/${powerGif}`)
    .setColor('#ffc948')
    .setFooter({
      text: (reactionTime || reactionTime === 0) && reactionTime < 1500 ? `Reaction time: ${reactionTime}ms` : `Earn keycaps by hitting the tumbleweed!`, 
      iconURL: (reactionTime || reactionTime === 0) && reactionTime < 1500 ? `https://mechakeys.robolab.io/discord/media/records/smallspeed2.gif` : 'https://mechakeys.robolab.io/discord/media/alert.png'
    })
    .setDescription(`
      ${random.message}  \n
      **The tumbleweed should be coming back down in ${timeInAir > 60 ? Math.round(timeInAir/60) + ' minutes!' : timeInAir + ' seconds!'}** \n
      **Power:** \`${random.power}\`
      **XP Gained:** \`${(Math.max(1,Math.round(random.power/30))*3)}${isBooster(msg.guild, msg.author.id) ? '(x2)' : ''}\`${random.power > 50 ? `\n **Game Duration**: \`${Math.round((Date.now() - startTime) / 1000 / 60)} minutes\`` : ''}
    `)
  ]})

  var hitMiniEmbed = (msg, startTime, powerGif, timeInAir, random, reactionTime) => {
    const embed = new EmbedBuilder()
    // .setTitle(`@${msg.author.username} hit the tumbleweed!`)
    // .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/${powerGif}`)
      .setColor('#ffc948')
      .setDescription(`<@${msg.author.id}> hit the tumbleweed!
        **Power:** \`${random.power}\` || **Tumbleweed returns:** \`${timeInAir > 60 ? Math.round(timeInAir/60) + ' minutes!' : timeInAir + ' seconds!'}\`
      `)
      if ((reactionTime || reactionTime === 0) && reactionTime < 1500) {
        embed.setFooter({
          text: (reactionTime || reactionTime === 0) && reactionTime < 1500 ? `Reaction time: ${reactionTime}ms` : `Earn keycaps by hitting the tumbleweed!`, 
          iconURL: (reactionTime || reactionTime === 0) && reactionTime < 1500 ? `https://mechakeys.robolab.io/discord/media/records/smallspeed2.gif` : 'https://mechakeys.robolab.io/discord/media/alert.png'
        })
      }
    return {embeds: [embed]}
  }

  var fallingEmbed = (startTime, emergency) => {
    if (emergency) {
      const embed = new EmbedBuilder()
        .setTitle(`UHHH, THE TUMBLEWEED IS ABOUT TO HIT THE GROUND!!!`)
        .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/Falling.gif`)
        .setColor('#ff0000')
        .setDescription(`
          I already told you it was coming down, but it's about to *hit the ground*, which means the game ends!!!
          To hit the tumbleweed, send any <:tumbleweed:702482059095965706> tumbleweed emoji.
        `)
        .setFooter({text: `DUDE! HIT IT!!! AAHHHH`, iconURL:'https://mechakeys.robolab.io/discord/media/alert.png'})

        return {embeds: [embed]}
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`The tumbleweed is coming back down!`)
        .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/Falling.gif`)
        .setColor('#ffc948')
        .setDescription(`
          Hit it back up before it hits the ground!
          To hit the tumbleweed, send any <:tumbleweed:702482059095965706> tumbleweed emoji.
        `)
        if (((Date.now() - startTime) < 1200000)) {
          embed.setFooter({text:`Earn keycaps and XP by hitting the tumbleweed!`, iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
        }
        return {embeds: [embed]}
    }

  }

  var gameoverEmbed = {embeds: [new EmbedBuilder()
    .setTitle('Game over.')
    .setColor('#ffc948')
    .setImage('https://mechakeys.robolab.io/discord/media/tumblebounce/riptumble.gif')
    // .setFooter({text:'Someone needs to send a tumbleweed emoji within 30 seconds!', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`The tumbleweed hit the ground and died.`)
  ]}

  var statsEmbed = ({uniquePlayerCount, bounces, duration, reward, powerBoard}) => ({embeds: [new EmbedBuilder()
    .setTitle('Tumblebounce game stats & rewards.')
    .setColor('#ffc948')
    // .setFooter({text:'Someone needs to send a tumbleweed emoji within 30 seconds!', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`
      **Players**: \`${uniquePlayerCount}\`
      **Bounces**: \`${bounces}\`
      **Game Duration**: \`${Math.round( (duration /1000 /60) )} minutes\`
      **Rewards**: All players won ${reward} keycaps \n
      **Most Powerful Players**
      ${powerBoard}
    `)
  ]})

  
}


var between, endGame, save_remote_tumbleweed;
HELPERS : {
  // NOTE: non-inclusive of min value
  var between = (x, min, max) => {
    return x > min && x <= max;
  }

  var endGame = async (msg, originating_bounce_uuid) => {
    let currentGames = useGames()
    let tumblebounce = currentGames[msg.channelId].tumblebounce
  
    if (tumblebounce.needTouch && tumblebounce.bounce_uuid === originating_bounce_uuid) {
      const copyGame = tumblebounce
      delete currentGames[msg.channel.id].tumblebounce
      save_remote_tumbleweed(msg.guild.id, `c_${env}_${msg.channel.id}_tumblebounce`, false)
      msg.channel.send(gameoverEmbed)
  
      await wait(2000)
  
      // Get sorted winners
      const sortedWinners = Object.entries(copyGame.bouncer_scores)
        .map((x) => {
          return { 'id': x[0],'username': x[2], 'power': x[1]}
        })
        .sort(function(a, b) {
          return b.power - a.power;
        });
  
      // Calc stats
      const powerBoard = sortedWinners.map(x=>`<@${x.id}>: ${x.power}`).join('\n')
      const powerSum = sortedWinners.reduce((accu, curr) => accu + curr.power, 0)
      const winners = [...new Set(copyGame.bouncer_ids)]
      let rewardDivider = 1
      // Greater than 24 hours
      if ((Date.now() - copyGame.startTime) > 3600000*24 ) {
        rewardDivider = 0.5
      }
      // Less than 8 hours (Level 3)
      if ((Date.now() - copyGame.startTime) < 3600000*8 ) {
        rewardDivider = 1.2
      }
      // Less than 4 hours (Level 2)
      if ((Date.now() - copyGame.startTime) < 3600000*4 ) {
        rewardDivider = 2
      }
      // Less than 1 hours
      if ((Date.now() - copyGame.startTime) < 3600000 ) {
        rewardDivider = 3
      }
      statsObj = {
        reward: Math.round( Math.min(1000, Math.round(powerSum / 7 / (winners.length + 30))) /rewardDivider),
        uniquePlayerCount: winners.length,
        bounces: copyGame.bouncer_ids.length,
        duration: (Date.now() - copyGame.startTime),
        powerBoard,
      }
      records.checkRecord(msg.guild.id, `tumblebounce`, 'mostPowerfulPlayer', sortedWinners[0].power, 'greater', sortedWinners[0].id, msg)
      if (copyGame.started_by) {
        records.checkRecord(msg.guild.id, `tumblebounce`, 'longestGameStartedBy', statsObj.duration, 'greater', copyGame.started_by, msg)
      }
      records.checkRecord(msg.guild.id, `tumblebounce`, 'longestGameLastHit', statsObj.duration, 'greater', msg.author.id, msg)
  
      // send stats and give rewards
      msg.channel.send( statsEmbed(statsObj) )
      const awardRes = awardAll(msg.guild, winners, statsObj.reward, 'tumble-bounce')
  
    }
  }

  var save_remote_tumbleweed = async (guildID, key, value) => {
    const saveRes = await discordAPI.setGuildField(guildID, {
      guildObject: value,
      guildField: key
    })
    console.log('IDK if this works in prod', saveRes)
    return saveRes
  }
}


module.exports = async (msg) => {
  let currentGames = useGames()
  let tumblebounce = currentGames[msg.channelId].tumblebounce

  // in the validTumbles array, is there some tumble where the msg.content includes the tumble?
  const authID = msg.author.id
  if (validTumbles.some(theTumble => msg.content.includes(theTumble)) && (tumblebounce.needTouch || (tumblebounce.need_remote_start && tumblebounce.return_time < Date.now()))) {
      let reactionTime = false
      if (currentGames[msg.channel.id].tumblebounce.needTouchTime) {
        reactionTime =  Date.now() - currentGames[msg.channel.id].tumblebounce.needTouchTime
      }

      // Catch repeat hit
      if (tumblebounce.bouncer_ids[tumblebounce.bouncer_ids.length-1] === authID) {
        msg.channel.send({
          content: `<@${authID}> you just hit it last time! You are still recharging, someone else needs to hit the tumbleweed!`
        })
        return
      }
      tumblebounce.need_remote_start = false

      // Add hit to game state
      tumblebounce.needTouch = false
      if (currentGames[msg.channel.id].tumblebounce.needTouchTime && (reactionTime || reactionTime === 0)) {
        records.checkRecord(msg.guild.id, `tumblebounce`, 'fastestHit', reactionTime, 'less', msg.author.id, msg)
      } else {
        console.log(currentGames[msg.channel.id].tumblebounce.needTouchTime)
        console.log(`Not checking record because ^`)
      }
      tumblebounce.bouncer_ids.push(authID)
      tumblebounce.bouncer_scores[authID] = tumblebounce.bouncer_scores[authID] || 0
      tumblebounce.bounce_uuid = `${Date.now()}` // Hit ID
      msg.react('✅')

      let check = await discordAPI.incrementField(authID, {
        field: "tumbleweedsBounced",
      });
      console.log('idk if this works in prod 2', check)

      // Get random constants
      let random = getRandom('tumbleBounce', 'hits')
      // Robby: yes we overwrite the static power below
      // yes we had this issue already
      // yes we decided to leave it because it rewards record hunters
      random.power = random.power + Math.round(Math.random() * (random.power / 9.9))
      let timeInAir = Math.round(random.power - (random.power * 0.1))

      // Got to level 2
      if ( ((tumblebounce.level_msg || 0) < 2) && between(3600000, (Date.now() - tumblebounce.startTime) - 60000, (Date.now() - tumblebounce.startTime) + timeInAir*1000)) {
        tumblebounce.level_msg = 2
        pyroBar.fillDatBoost(msg.client, 5, '462274708499595266', 20)
        setTimeout(() => {
          const embed = new EmbedBuilder()
            .setTitle(`The tumbleweed... leveled up??`)
            .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl2.gif`)
            .setColor('#ffc948')
            .setFooter({text:`Endgame keycap rewards increased!`, iconURL: `https://mechakeys.robolab.io/discord/media/tumblebounce/lvl2.gif`})
            .setDescription(`The tumbleweed leveled up to \`level 2\`!\nWhatever that means...`)
          msg.channel.send({ embeds: [embed] })
        }, 2000);

      }
      // Got to level 3
      if ( ((tumblebounce.level_msg || 0) < 3) && between(3600000*4, (Date.now() - tumblebounce.startTime) - 60000, (Date.now() - tumblebounce.startTime) + timeInAir*1000)) {
        tumblebounce.level_msg = 3
        pyroBar.fillDatBoost(msg.client, 10, '462274708499595266', 30)
        setTimeout(() => {                    
          const embed = new EmbedBuilder()
            .setTitle(`The tumbleweed leveled up!`)
            .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl3.gif`)
            .setColor('#ffc948')
            .setFooter({text:`Endgame keycap rewards increased (again!)`, iconURL:`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl3.gif`})
            .setDescription(`The tumbleweed leveled up to \`level 3\`!\nKeep it up! Literally.`)
            msg.channel.send({ embeds: [embed] })
        }, 2000);

      }
      // Got to level 4
      if ( ((tumblebounce.level_msg || 0) < 4) && between(3600000*8, (Date.now() - tumblebounce.startTime) - 60000, (Date.now() - tumblebounce.startTime) + timeInAir*1000)) {
        tumblebounce.level_msg = 4
        pyroBar.fillDatBoost(msg.client, 30, '462274708499595266', 30)
        setTimeout(() => {
          const embed = new EmbedBuilder()
            .setTitle(`What!? The tumbleweed leveled up again!`)
            .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl4.gif`)
            .setColor('#ffc948')
            .setFooter({text:`Endgame keycap rewards have increased again!!!`, iconURL: `https://mechakeys.robolab.io/discord/media/tumblebounce/lvl4.gif`})
            .setDescription(`The tumbleweed leveled up to \`level 4\`!\nMOAR KEYCAPS!`)
          msg.channel.send({ embeds: [embed] })
        }, 2000);

      }
      // Got to level 5 (24 hours)
      if ( ((tumblebounce.level_msg || 0) < 5) && between(3600000*24,(Date.now() - tumblebounce.startTime) - 60000, (Date.now() - tumblebounce.startTime) + timeInAir*1000)) {
        tumblebounce.level_msg = 5
        pyroBar.fillDatBoost(msg.client, 40, '462274708499595266', 60)
        setTimeout(() => {
          const embed = new EmbedBuilder()
            .setTitle(`The tumbleweed has ASCENDED!`)
            .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl5.gif`)
            .setColor('#ffc948')
            .setFooter({text:`Endgame keycap rewards have DOUBLED now!`, iconURL:`https://mechakeys.robolab.io/discord/media/tumblebounce/lvl5.gif`})
            .setDescription(`\`Greetings humans. It is I, the Tumbleweed. You have hit me so many times, I am a very, very proud Omnipresent Tumbleweed. The ground is the enemy, and I thank all of you for standing on such cursed land to protect me from my doom.\``)
          msg.channel.send({ embeds: [embed] })
        }, 2000);

      }

      tumblebounce.bouncer_scores[authID] += random.power
      tumblebounce.return_time = Date.now() + timeInAir * 1000 // unused locally but will be used for remote restart
      const powerGif = getFlavor('tumbleBounce', 'powerGifs', random.power)
      records.checkRecord(msg.guild.id, `tumblebounce`, 'hardestHit', random.power, 'greater', msg.author.id, msg)
      records.checkRecord(msg.guild.id, `tumblebounce`, 'weakestHit', random.power, 'less', msg.author.id, msg)
      // HIT TUMBLEWEED
      if ( ((Date.now() - tumblebounce.startTime) > 1800000) && random.power < 270) {
        msg.channel.send(hitMiniEmbed(msg, tumblebounce.startTime, powerGif, timeInAir, random, reactionTime))
      } else {
        msg.channel.send(hitEmbed(msg, tumblebounce.startTime, powerGif, timeInAir, random, reactionTime))
      }
      pyroBar.fillDatBoost(msg.client, Math.max(1, random.power/100), '462274708499595266', Math.max(1, random.power/100))
      xpBot.giveXP(msg.author, Math.max(1, Math.round(random.power / 30))*3, msg.channel, msg.client)
      let originating_bounce_uuid = `${tumblebounce.bounce_uuid}` // Hit ID
      save_remote_tumbleweed(msg.guild.id, `c_${env}_${msg.channel.id}_tumblebounce`, tumblebounce)

      setTimeout(function() {
        currentGames[msg.channel.id].tumblebounce.needTouch = true
        currentGames[msg.channel.id].tumblebounce.needTouchTime = Date.now()
        console.log(`Setting needTouchTime!`,currentGames[msg.channel.id].tumblebounce.needTouchTime)
        msg.channel.send(fallingEmbed(tumblebounce.startTime))

        setTimeout(() => {
          if (tumblebounce.needTouch && tumblebounce.bounce_uuid === originating_bounce_uuid) {
            msg.channel.send(fallingEmbed(tumblebounce.startTime, true))
            setTimeout(endGame, 20000, msg, originating_bounce_uuid)
          }
        }, 40000);

        // setTimeout(endGame, 20000, msg, currentGames, originating_bounce_uuid, developerAPI);
      }, timeInAir * 1000);

  } else if (tumblebounce.need_remote_start) {
    tumblebounce.need_remote_start = false

    // give tumblebounce a silent "kick"
    setTimeout(function() {
      currentGames[msg.channel.id].tumblebounce.needTouch = true
      currentGames[msg.channel.id].tumblebounce.needTouchTime = Date.now()
      console.log(`Setting needTouchTime!`,currentGames[msg.channel.id].tumblebounce.needTouchTime)
      msg.channel.send(fallingEmbed(tumblebounce.startTime))

      // If originating_bounce_uuid does not update in given time(ie no hit), end game
      setTimeout(endGame, 45000, msg, tumblebounce.bounce_uuid);
    }, Math.max(tumblebounce.return_time - Date.now()), 1000); // Even if it's late, give 1 second buffer
    return

  }

  return
}