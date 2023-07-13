const { EmbedBuilder } = require('discord.js')

const { getFlavor, awardAll } = require("./helpers")
const { useGames } = require('./gameState')

module.exports = async (msg) => {
  let gameState = useGames()
  let tumblestreak = gameState[msg.channelId].tumblestreak

  if (msg.content.includes(":tumb")) {
    let threshold = 5*60*1e3 // 5 mins
    let uid = msg.author.id
    let uLast = tumblestreak.streakers?.[uid]?.lastHit || Date.now() - threshold

    if (
      tumblestreak.last === uid &&     // ignore consecutive
      Date.now() - uLast <= threshold  // given time not yet passed
    ) return

    tumblestreak.streakers[uid] = {
      count: +(tumblestreak.streakers?.[uid]?.count) + 1 || 1,
      user: msg.author,
      lastHit: Date.now()
    }
    tumblestreak.last = uid
    msg.react('✅')
  } else {
    // Get Flavor
    const score = Object.values(tumblestreak.streakers).reduce((a,c) => a + c.count, 0)
    const flavor = getFlavor('tumblestreak', 'end_flavor', score)

    let scaleFactor = 0.75 //0.3475 // 24hrs = 5min * 288times. so, 288 * 0.3475 = 100 keycaps 
    let rewards = Object.entries(tumblestreak.streakers).reduce(
      (a,[id, v])=>[...a, [v.count, (2 + v.count * scaleFactor)|0, v.user]],
    []).sort()
    
    const embed = new EmbedBuilder()
      .setTitle(`@${msg.author.username} ended the streak!`)
      .setThumbnail(`https://i.imgur.com/wQlZLat.gif`)
      .setColor('#ffc948')        
      .setFooter({text: 'To earn keycaps from minigames, you need to link your account with >link username.', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png'})
      .setDescription(`${flavor} \n 
        **Streak Length:** \`${score}\` \n
        **Game Duration:** \`${(Date.now() - tumblestreak.startTime)/1000} seconds\` \n
        **Winners:** \n\`\`\`${
          rewards.map(([count, amount, user]) => `• ${count}: ${user.username} - ${amount}kc`).join('\n')
        }\`\`\`
      `)
  
    msg.channel.send({embeds: [embed]})
    const awardRes = await awardAll(msg.guild, rewards, ([count, amount, user])=>amount, 'tumblestreak',  ([count, amount, user])=>user.id)

    delete gameState[msg.channelId].tumblestreak
  }
}