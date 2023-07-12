const { SlashCommandBuilder } = require("discord.js")
const { EmbedBuilder } = require('discord.js')
const { useGames } = require('../games/gameState')
const commandAccumulator = require("../utils/commandAccumulator")

const { static } = require("robo-bot-utils");
const { panelOpenings, riddles } = static.flavors.bombsquad

const {Status_Dead, ch_graveyard} = require('../ids')
const wait = require('../utils/wait')

exports.alias = ['bs']
exports.data = new SlashCommandBuilder()
	.setName('bombsquad')
	.setDescription(`if riddles and rng were life and death`)


exports.execute = async (act) => {
  await act.deferReply()

  let channelID = act.channelId
  let currentGames = useGames()

  // Catch pre-existing
  if (currentGames[channelID] && currentGames[channelID].bombsquad) {
    return act.channel.send(
      "A bomb has already been planted!"
    )
  }

  // catch cmd accumulator
  const out_of_uses = !(await commandAccumulator(act, 'bombsquad', false, true))
  if (out_of_uses) return currentGames


  act.channel.setRateLimitPerUser(1, 'gametime_start')

  // Init game instance
  currentGames[channelID] = currentGames[channelID] || {}
  let bombsquad = {
    victims: [],
    players: [],
    player_ids: [],
    startTime: Date.now(),
    config:{
      stage_delay: 11000 // ms, delay between stage complete and next stage
    },
    bomb_times: {
      base_time: 40000, // basetime of one minute
      extra_time: 0,    // gonbe adding to this to avoid the bomb exploding in between stages
      death_time: 60000 * 2
    },
    bomb_uuid: `${Date.now()}`,
    stage: 0,
    stage_obj: {
      1: generatePanel(),
      2: generateKeycode(),
      3: generateRiddle(),
      4: { good_wire:  wires[Math.floor(Math.random() * wires.length)], wires: wires}
    },
    explode: async (bombsquad, guild, act) => {
      const unique_victim_ids = [...new Set(bombsquad.victims.map(x => x.id))]
      let reveal_answer_message = ''
      if (bombsquad.stage === 2) {
        reveal_answer_message = `The keycode was \`${bombsquad.stage_obj[2].code}\`!`
      } else if (bombsquad.stage === 4) {
        reveal_answer_message = `The correct wire was ${bombsquad.stage_obj[4].good_wire}!`
      }
      const explodeEmbed = new EmbedBuilder()
        .setColor('#e51717')
        .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/explode.gif')

        await act.channel.send({ embeds: [explodeEmbed] })

        const explodeEmbed2 = new EmbedBuilder()
          .setColor('#e51717')
          .setTitle('The bomb EXPLODED!')
          .setDescription(`\n ${unique_victim_ids.length + 1} people died in the blast, including the Mayor! \n ${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`)

        act.channel.send({ embeds: [explodeEmbed2] })
        let deadrole = guild.roles.cache.get(Status_Dead) //Dead role
        act.channel.setRateLimitPerUser(0, 'gametime_end')

        unique_victim_ids.map(async (x, i) => {
          await wait(200 * i)
          const victim = guild.members.cache.get(x) // Dead user object
          if (!victim) { return }
          victim.roles.add(deadrole) // Add dead role to user who died
          setTimeout(async () => {
            try {
              victim.roles.remove(deadrole)
            } catch(e) {
              console.error(e)
            }
          }, (bombsquad.bomb_times.death_time) + Math.random())
        })

        setTimeout(() => {
          let revivedEmbed = new EmbedBuilder()
              .setColor("2f3136")
              .setDescription(`<:bodyguards:816114055030767638> **${unique_victim_ids.length} people have been resurrected!** <:bodyguards:816114055030767638> \n ${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`)
          act.channel.send(`revived! ${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`).then(m => { m.delete(); });
          act.channel.send({ embeds: [revivedEmbed] })
        }, (bombsquad.bomb_times.death_time))

        const graveyard = guild.channels.cache.get(ch_graveyard) // Graveyard channel

      let graveyardEmbed = new EmbedBuilder()
          .setColor("2f3136")
          .setDescription(`<:cute_robo_broked:816198206718738442> **${unique_victim_ids.length} people died from an EXPLOSION!** <:cute_robo_broked:816198206718738442> \n **RIP:**${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`)

      const deadedMessage = await graveyard.send(`dead-ed! ${unique_victim_ids.map(x => `<@${x}>`).join(', ')}`).then(m => { m.delete(); });
      const graveyardMessage = await graveyard.send({ embeds: [graveyardEmbed] })

        setTimeout(() => {
          act.channel.send(`🪦 The dead are now in: <#774338256112058398> 🥀`) // headstone and wilted rose
        }, (1500))

        if (reveal_answer_message) {
          await graveyard.send(reveal_answer_message)
        }

        bombsquad.stage = 0
    }

  }
  currentGames[channelID].bombsquad = bombsquad
  console.log('Answers:', bombsquad.stage_obj)
  

  bombsquad.intervalChecker = setInterval(() => {
    const millisecondsLeft = (Date.now() - (bombsquad.startTime + bombsquad.bomb_times.base_time + bombsquad.bomb_times.extra_time))*-1
    const roundedSecondsLeft = Math.round(millisecondsLeft/1000)

    if (roundedSecondsLeft === 10) {
      act.channel.send(`<a:red_siren:812813923522183208> The bomb is going to explode in **${roundedSecondsLeft} seconds!** <a:red_siren:812813923522183208>`)
    }

    if (roundedSecondsLeft <= 5 && roundedSecondsLeft > 0) {
      act.channel.send(`<a:red_siren:812813923522183208> **${roundedSecondsLeft}!!!** <a:red_siren:812813923522183208>`)
    }


    if (Date.now() > bombsquad.startTime + bombsquad.bomb_times.base_time + bombsquad.bomb_times.extra_time + 1000 ) {
      // BOMB HAS EXPLODED - kill everyone who played
      const game_copy = Object.create(bombsquad)
      bombsquad.explode(bombsquad, act.guild, act)
      delete currentGames[act.channel.id].bombsquad
      return clearInterval(bombsquad.intervalChecker)
    }
  }, 1000);



  const initEmbed = new EmbedBuilder()
    .setColor('#e51717')
    .setImage('https://mechakeys.robolab.io/discord/media/bombsquad/bombsquad.png')

  const initEmbed2 = new EmbedBuilder()
    .setColor('#e51717')
    .setFooter({text:'Post the correct default emoji, like 🔧, to reveal the bomb!', iconURL:'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`\`${currentGames[channelID].bombsquad.stage_obj[1].question.q}\` \n What tool do you use to reveal the bomb?`)
    
  await act.editReply({ embeds: [initEmbed, initEmbed2] }) //.then(act => act.channel.send({ embeds: [] }))

  bombsquad.emojiriddle_starttime = Date.now()

  // Reminder block
  setTimeout(() => {
    if (bombsquad.stage === 1) {
      const reminderEmbed = new EmbedBuilder()
        .setColor('#e51717')
        .setDescription(`**Reminder:**\n\`${currentGames[channelID].bombsquad.stage_obj[1].question.q}\` \n What tool do you use to reveal the bomb?`)
      act.channel.send({ embeds: [reminderEmbed] })
    }
  }, bombsquad.bomb_times.base_time / 2);

  bombsquad.stage = 1
}


const generateRiddle = () => {
  let riddle = riddles[Math.floor(Math.random() * riddles.length)]
  return {question: riddle.question.length > 1 ? riddle.question[Math.floor(Math.random() * riddle.question.length)] : riddle.question, answer: riddle.answer}
}
const wires = [ '🟩','🟥','🟦' ]

const generatePanel = () => {
  let panel = panelOpenings[Math.floor(Math.random() * panelOpenings.length)]
  return {question: panel.question[Math.floor(Math.random() * panel.question.length)], answer: panel.answer}
}
const generateKeycode = () => {
  const code = `${Math.floor(1000 + Math.random() * 9000)}`
  const codeHint = [...new Set(code.split('').sort())]
  return {
    code, codeHint
  }
}