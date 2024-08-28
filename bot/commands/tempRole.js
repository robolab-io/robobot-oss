const parseDuration = require('parse-duration')
const createEvent = require('.././utils/createEvent')
const { MessageEmbed } = require("discord.js");
function timeConversion(millisec) {
  let seconds = Math.round(millisec / 1000);
  let minutes = Math.round(millisec / (1000 * 60));
  let hours = Math.round(millisec / (1000 * 60 * 60));
  let days = Math.round(millisec / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
      return seconds + " seconds";
  } else if (minutes < 60) {
      return minutes + " minutes";
  } else if (hours < 24) {
      return hours + " hours";
  } else {
      return days + " days"
  }
}

const roleMap = {
  'xpboost': '812464225548369951',
  'shame': '796150709090648084',
  'roleofshame': '796150709090648084',
  'best': '810662733791100968',
  'bestmember': '810662733791100968',
  'bestmemberoftheday': '810662733791100968'
}

module.exports.tempRole = async (msg, { args, getMember }) => {
  let commandFormatReminderEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setDescription("<a:red_siren:812813923522183208> `>tempRole [roleID] @user [duration]`")
  if (!args || !args[0] || !args[1]) return msg.channel.send(commandFormatReminderEmbed)  
  let userID = getMember(args[1])                     // get user discord ID
  const userObj = msg.guild.members.cache.get(userID) // get user discord Object
  let roleID = args[0] // DID TO: make dynamic
  if (isNaN(roleID) ) { roleID = roleMap[roleID] }
  let notARoleEmbed = new MessageEmbed()
  .setColor("2f3136")
  .setDescription("<a:red_siren:812813923522183208> Role name not supported. Use the ID instead.")
  if (!roleID) return msg.channel.send(notARoleEmbed)
  userObj.roles.add(roleID) // add the role

  const duration = parseDuration(args[2])

  createEvent.removeRole(msg.guild.id, userID, roleID, duration)
  return msg.reply({
    "content": `<@${userID}> given \`<@&${roleID}>\` for ${timeConversion(duration)}!`,
    "allowed_mentions": {
      "parse": []
    }
  })
  
}
 