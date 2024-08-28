const codeTips = require('../static/codeTips')
const { MessageEmbed, Message } = require("discord.js");


module.exports.roleCount = async (msg, {args, roles}) => {
  if(!args[0]) {
    let noArgsEmbed = new MessageEmbed()
    .setColor(`2f3136`)
    .setDescription("<a:red_siren:812813923522183208> You didn't provide a **role ID**.")
    return msg.channel.send(noArgsEmbed)
  }
  
  const mention = args[0].match(/^<@&(\d+)>$/)
  const id = mention? mention[1]: args[0]
  const role = roles.get(id)

  if (!role) {
    let doesntExistEmbed = new MessageEmbed()
    .setColor(`2f3136`)
    .setDescription("<a:red_siren:812813923522183208> You didn't provide a **valid role ID**.")
    return msg.channel.send(doesntExistEmbed)
  }
  
  const count = role.members.size
  if (count < 100) {console.log(role.members.map(x => x.id))}  

  var embed = new MessageEmbed({
    title: `There are **${count}** users in the **${role.name}** role.`,
    color: `2f3136`
  })
  msg.channel.send(embed)
}
