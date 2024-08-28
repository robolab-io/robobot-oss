const { MessageEmbed } = require("discord.js");
const axios = require('axios');
const commandLimiter = require('./../utils/commandLimiter');
const objectHash = require("object-hash");

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

module.exports.adminLeaders = async (msg, { developerAPI }) => {
  if (commandLimiter(msg)) return

  const { data } = await axios.get(`${developerAPI}?action=getWeeklyLeaders`)
  // Build Field Arrays
  var [ranks, users, keystrokes] = [[], [], []]
  data.data.leaders.slice(0, 10).forEach((obj, i) => {
    //ranks.push(i < 3 ? [':first_place:', ':second_place:', ':third_place:'][i] : i + 1 + 'ᵀᴴ')
    users.push(
      (i + 1) + " - " +
      obj.username + " - " +
      "**\`" +
      obj.keystrokes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      "\`**" + " - " + obj.keystrokeTimestamp + ` **(${timeConversion(Date.now() - obj.keystrokeTimestamp) + ' ago'})**` + " - " + (obj.cheatAmount || "0") + " - " + (obj.cheatCount || "0"))
  })
  let emb = new MessageEmbed()
    .setTitle(`[Admin] Leaderboard of ${new Date(+data.data.leaders[0].weekID).toLocaleDateString()}`)
    .addField("Format", "place - username - filteredKeystrokes - lastSynced - cheatAmount - cheatCount")
    .setDescription(users.join('\n'))
    .setColor("2f3136")
    .setThumbnail(`https://mechakeys.robolab.io/discord/media/records/record_multi.gif`)
  msg.channel.send(emb)
}
