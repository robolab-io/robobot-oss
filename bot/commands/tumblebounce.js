const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const commandAccumulator = require("../utils/commandAccumulator")

const { useGames } = require('../games/gameState')


exports.alias = ['tb']
exports.data = new SlashCommandBuilder()
		.setName('tumblebounce')
		.setDescription('the popular tumbleweed game')


// currentGames
exports.execute = async (act) => {
  await act.deferReply()

  let channelID = act.channelId
  let currentGames = useGames()

  // get current channel #bot-dev = 751665008869376010
  if (currentGames[channelID] && currentGames[channelID].tumblebounce) {
    return act.editReply({content: "TumbleBounce already active!" });
  }
  //const out_of_uses = !(await commandAccumulator(act, 'tumblebounce', false, true))
  //if (out_of_uses) return
  currentGames[channelID] = currentGames[channelID] || {}
  let tumblebounce = {
    bouncers: [],
    bouncer_ids: [],
    bouncer_scores: {},
    startTime: Date.now(),
    bounce_uuid: `${Date.now()}`,
    needTouch: true,
    started_by: act.user.id
  }
  currentGames[channelID].tumblebounce = tumblebounce

  // Initial throw
  setTimeout(function() {
    if( tumblebounce 
     && tumblebounce.needTouch 
     && !tumblebounce.bouncer_ids.length
    ) {
      delete currentGames[channelID].tumblebounce
      act.channel.send({content: 'The tumbleweed hit the ground, sad and alone.'}) 
    }
  }, 60000);

  const initEmbed = new EmbedBuilder()
    .setColor('#ffc948')
    .setImage('https://mechakeys.robolab.io/discord/media/tumblebounce.png')
    .setFooter({ text: 'Someone needs to send a tumbleweed emoji within 60 seconds!', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
    .setDescription(`<@${act.user.id}> triggered a minigame!`)
  act.editReply({ embeds: [initEmbed] })
  
}
