const supportThumbnail = 'https://media.discordapp.net/attachments/743978848692994109/814307225069682708/robo-bot-pink-blobby.png'
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { betterSwitch } = require("../utils/betterSwitch");


let helpEmbed = (msg) => new MessageEmbed()
.setTitle(`╔═════☩TM Info☩═════╗`)
  .addField("🌊 Water", "`TM03`")
  .addField("🔥 Fire", "`Nothing yet... check later!`")
  .addField("🍃 Grass", "`Nothing yet... check later!`")
  .setDescription(`Wanna learn more about the moves your Pokemon can learn? Check the TM case!`)
  .setFooter("Do >tm [TM] for more information!")
  .setThumbnail(`https://media.discordapp.net/attachments/860302356918566944/883839297080401970/unknown.png`)

const helpDct = {
  tm03 : (msg) => { return new MessageEmbed()
    .setAuthor('TM03 - Water Pulse', msg.author.avatarURL())
    .addField("Type", "🌊 Water")
    .addField("Detail", `**PP**: 20
    **Power**: 60
    **Accuracy**: 100`)
  },
}


module.exports.battleTM = async (msg, { args }) => {
  let command = args[0] ? args[0].toLowerCase() : ''
  command = command ? args.join(' ') : '' // join entire array into one string for 'spaced' names
  var embed = betterSwitch(helpDct)(helpEmbed)(command, msg)
  .setThumbnail(`https://media.discordapp.net/attachments/860302356918566944/883839297080401970/unknown.png`)
    .setColor("2D84FB")
  msg.channel.send(embed)
}
