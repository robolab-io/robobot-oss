const { EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Sends the ping of the bot.'),

  async execute(act) {
    let client = act.client
    let member = act.author
    let avatar = member.displayAvatarURL({size: 1024})
    
    const newPingEmbed = new EmbedBuilder()
      .setTitle(`:stopwatch: The Ping Meter`)
      .addFields(
          {name: `:robot: The Bot's Latency`, value: `**${Date.now() - act.createdTimestamp}**ms.`},
          {name: `:desktop: The API's Latency`, value: `**${Math.round(client.ws.ping)}**ms.`}
      )
      .setColor('RANDOM')
      .setFooter({
        text: `Requested by ${member.username}`, 
        iconURL: avatar
      })
      .setTimestamp()
    
    act.channel.send({embeds:[newPingEmbed]});
  }
}
