const { EmbedBuilder } = require('discord.js');

const records = require('../utils/records')
const xpBot = require('../utils/xpBot')
const pyroBar = require('../utils/pyroBar')

const { useGames } = require('./gameState')
const { awardAll } = require("./helpers");
const { discordAPI } = require("robo-bot-utils")


// A BOMB HAS BEEN PLANTED!!!
// Defuse it to get rewarded by the mayor!
// But fail to defuse it and you'll be killed if it explodes!

// Controls
// 1. Open up panel
// 🔨 ⛏️ 🔧 🔑 🗝️ 🪛 🔥 🔪 🪓 🖊️ ✏️ 📌 📍 📎 🧷 🧯 ✂️
// 2. Guess the keycode
// The numbers X X X X are worn down on the keypad!
// (1 4 8 2) (24 combinations)
// 1482, 1842, 1248, 1284, 1428,
// 3. Riddle to type in keypad
// "SAUSAGE" 
// 4. What wire do you cut?
// 🟩 🟥 🟦

module.exports = async (msg) => {
  let currentGames = useGames()
  let bombsquad = currentGames[msg.channelId].bombsquad
  const authorID = msg.author.id
  const msg_content = msg.content
  let time_to_add = 60000

  bombsquad.victims.push({ username: msg.author.username, id: msg.author.id}) // ANYONE talking gets added to the splosion radius


  /*** LEVEL 1 ***/
  if (bombsquad.stage === 1) {
    if (msg_content.length > 4) return // ignore bad entry

    // handle correct entry
    if (bombsquad.stage_obj[1].answer.includes(msg_content)) {
      bombsquad.stage = -1
      msg.react('✅')
      msg.channel.send(bombsquad.stage_obj[1].question.a.replace(/#I#/g, msg_content).replace(/#You#/g, `<@${authorID}>`))

      // increment user stats
      await discordAPI.incrementField(authorID, { field: 'bombRiddlesSolved' })
      
      // check record times
      records.checkRecord(msg.guild.id, `bombsquad`, 'solveClosestToExplosion',  (Date.now() - (bombsquad.startTime + bombsquad.bomb_times.base_time + bombsquad.bomb_times.extra_time))*-1, 'less', msg.author.id, msg)
      records.checkRecord(msg.guild.id, `bombsquad`, 'fastestEmojiriddle', Date.now() - bombsquad.emojiriddle_starttime, 'less', msg.author.id, msg)

      bombsquad.bomb_times.extra_time += time_to_add
      
      // AWARD XP
      setTimeout(() => {
        pyroBar.fillDatBoost(msg.client, 2, '462274708499595266', 20)
        xpBot.giveXP(msg.author, 50, msg.channel, msg.client)
      }, bombsquad.config.stage_delay/2)
      

      // Init Next Puzzle Level
      setTimeout(() => {
        // delete Level-1 answer
        msg.delete()

        const initEmbed = new EmbedBuilder()
        .setColor('#e51717')
        .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/numberpad_reactions.png')

        const initEmbed2 = new EmbedBuilder()
          .setColor('#e51717')
          .setDescription(`
            You approach the bomb.
            A numberpad (0-9) is on the front panel of the device with a screen that can display \`4 digits\`\n You notice that the numbers \`[${bombsquad.stage_obj[2].codeHint.join('] [')}]\` are worn and slightly faded!\n What numbers do you press?
          `)
          .setThumbnail('https://mechakeys.robolab.io/discord/media/alert.png')

        msg.channel.send({ embeds: [initEmbed] }).then(msg => msg.channel.send({ embeds: [initEmbed2] }))


        bombsquad.numcode_starttime = Date.now()
        bombsquad.stage = 2

        // Reminder block
        setTimeout(() => {
          if (bombsquad.stage === 2) {
            const reminderEmbed = new EmbedBuilder()
              .setColor('#e51717')
              .setDescription(`**Reminder:** You notice that the numbers \`[${bombsquad.stage_obj[2].codeHint.join('] [')}]\` are worn and slightly faded!\n What numbers do you press?`)
            msg.channel.send({ embeds: [reminderEmbed] })
          }        
        }, time_to_add / 2)

      },
        bombsquad.config.stage_delay
      )   
    }
  }


  /*** LEVEL 2 ***/
  if (bombsquad.stage === 2) {    
    if (msg_content.length > bombsquad.stage_obj[2].code.length * 2) return // ignore bad entry

    // handle correct entry
    if (msg_content.includes(bombsquad.stage_obj[2].code)) {
      bombsquad.stage = -2
      msg.react('✅')
      msg.channel.send(`With sweaty hands, <@${authorID}> pressed \`${bombsquad.stage_obj[2].code}\` and the device clicks, and opens up to reveal another screen and keyboard!`)

      // increment user stats
      await discordAPI.incrementField(authorID, { field: 'bombRiddlesSolved' })

      // check record times
      records.checkRecord(msg.guild.id, `bombsquad`, 'solveClosestToExplosion',  (Date.now() - (bombsquad.startTime + bombsquad.bomb_times.base_time + bombsquad.bomb_times.extra_time))*-1, 'less', msg.author.id, msg)
      records.checkRecord(msg.guild.id, `bombsquad`, 'fastestNumcode', Date.now() - bombsquad.numcode_starttime, 'less', msg.author.id, msg)
   
      bombsquad.bomb_times.extra_time += time_to_add/2
     
      // AWARD XP
      setTimeout(() => {
        pyroBar.fillDatBoost(msg.client, 1, '462274708499595266', 30)
        xpBot.giveXP(msg.author, 50, msg.channel, msg.client)
      }, bombsquad.config.stage_delay/2);
      

      // Init Next Puzzle Level
      setTimeout(() => {
        bombsquad.stage = 3
        const initEmbed = new EmbedBuilder()
          .setColor('#e51717')
          .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/keypad_reactions.png')        
        
        const initEmbed2 = new EmbedBuilder()
          .setColor('#e51717')
          .setDescription(`**A note with frantic writing is attached to the keyboard.** \n\`${bombsquad.stage_obj[3].question}\` \n --- \n What do you want to type into the keypad?`)

        msg.channel.send({ embeds: [initEmbed] }).then(msg => msg.channel.send({ embeds: [initEmbed2] }))
        bombsquad.wordriddle_starttime = Date.now()

      // Reminder block
      setTimeout(() => {
        if (bombsquad.stage === 3) {
          const reminderEmbed = new EmbedBuilder()
            .setColor('#e51717')
            .setDescription(`**Reminder:**\n\`${bombsquad.stage_obj[3].question}\` \n --- \n What do you want to type into the keypad?`)
          msg.channel.send({ embeds: [reminderEmbed] })
        }
      }, time_to_add / 3);

      },
        bombsquad.config.stage_delay
      )
    }
  }


  /*** LEVEL 3 ***/
  if (bombsquad.stage === 3) {

    // handle correct entry
    if (bombsquad.stage_obj[3].answer.includes(msg_content.toLowerCase().replace(/ /g, ''))) {
      msg.react('✅')
      bombsquad.stage = -3
      msg.channel.send(`<@${authorID}> typed \`${msg_content.toUpperCase().replace(/ /g, '')}\` and the device whirs and vibrates, and begins to open, revealing multiple colorful wires!`).then(x => {
        setTimeout(() => x.delete(), 30000)
      })

      // increment user stats
      await discordAPI.incrementField(authorID, { field: 'bombRiddlesSolved' })

      // check record times
      records.checkRecord(msg.guild.id, `bombsquad`, 'solveClosestToExplosion',  (Date.now() - (bombsquad.startTime + bombsquad.bomb_times.base_time + bombsquad.bomb_times.extra_time))*-1, 'less', msg.author.id, msg)
      records.checkRecord(msg.guild.id, `bombsquad`, 'fastestWordriddle', Date.now() - bombsquad.wordriddle_starttime, 'less', msg.author.id, msg)

      bombsquad.bomb_times.extra_time += 20000
      

      // AWARD XP
      setTimeout(() => {
        pyroBar.fillDatBoost(msg.client, 1, '462274708499595266', 30)
        xpBot.giveXP(msg.author, 50, msg.channel, msg.client)
      }, bombsquad.config.stage_delay/2)


      // Init Last Puzzle Level
      setTimeout(async () => {
        bombsquad.stage = 4

        const initEmbed = new EmbedBuilder()
          .setColor('#e51717')
          .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/wires_reactions.png')
          .setFooter({ text: 'You see a ton of colorful wires. What wire do you cut?!?' })

        const wireCutMessage = await msg.channel.send({ embeds: [initEmbed] })
        bombsquad.stage_obj[4].wires.map(x => {
          wireCutMessage.react(x)
        })
        const wireCutStartTime = Date.now()
        console.log('Good Wire:', bombsquad.stage_obj[4].good_wire)

        // Check Wire Votes (Interval)
        const wireChecker = setInterval(async () => {

          if (!bombsquad.stage)  clearInterval(wireChecker) // ?

          const votes = bombsquad.stage_obj[4].wires.map(x => {
            const reactions = wireCutMessage.reactions.cache.get(x) || {}
            return { wire: x, votes: (reactions.count || 1) - 1 }
          })

          let totalVotes = 0
          votes.forEach(x => { totalVotes += x.votes }) 

          if (Date.now() >  wireCutStartTime + 8000) {

            const choice = votes.find(x => x.votes/totalVotes > 0.5)
            if (!choice && !bombsquad.stage_obj[4].warned_for_majority) {
              // a color must have 50% majority to Proceed (else interval loops again)  
              bombsquad.stage_obj[4].warned_for_majority = 1
              msg.channel.send('A wire color must have a voting majority! Quick! Agree on something!')
            } else 
            if (choice) {
              // Vote has been cast
              clearInterval(wireChecker)
              clearInterval(bombsquad.intervalChecker)
              msg.channel.send(`You lean in close and cut the ${choice.wire} wire...`)

              const game_copy = Object.create(bombsquad)
              setTimeout(async () => {
                
                // Won
                if (bombsquad.stage_obj[4].good_wire === choice.wire) {
                  const initEmbed = new EmbedBuilder()
                    .setTitle('You defused the bomb!')
                    .setColor('#e51717')
                    .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/bombmayor.png')
                    .setFooter({text: '"Thank you!", the Mayor says, as he hands you the key to the city. He also slams a bag of keycaps in front of you, this is for you!'})

                  const unique_victim_ids = [...new Set(bombsquad.victims.map(x => x.id))]
                  const reward = Math.floor(Math.abs(Math.random() - Math.random()) * (1 + 80 - 20) + 5)

                  // Send response messages
                  await msg.channel.send({ embeds: [initEmbed] })
                  await msg.channel.send(`**Reward:** ${reward} keycaps!\n**XP:** 50 \n**Defusers:** ${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`)
                  
                  // Award users
                  awardAll(msg.guild, unique_victim_ids, reward, 'bomb-squad')
                  unique_victim_ids.map( ids => {
                    discordAPI.incrementField(ids, { field: 'bombsDefused' })
                    return xpBot.giveXP(ids, 50, msg.channel, msg.client)
                  })

                  pyroBar.fillDatBoost(msg.client, 25, '462274708499595266', unique_victim_ids.length*2)
                }

                // Lost
                else {
                  bombsquad.explode(game_copy, msg.guild, msg)
                }

                // End Game
                msg.delete() // delete level-3 answer
                delete currentGames[msg.channel.id].bombsquad

              }, 1700 + Math.random()*5000)              
            }
          }
        }, 950);

        bombsquad.stage = 4
      }, bombsquad.config.stage_delay);
    }
  }

  return
}
