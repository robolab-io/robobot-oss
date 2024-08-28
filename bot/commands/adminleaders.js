const { EmbedBuilder } = require("discord.js");
const { devAPI } = require("robo-bot-utils");
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

module.exports = {
  //alias: ['al'],
  data: new SlashCommandBuilder()
    .setName('adminleaders')
    .setDescription('Displays the admin leaderboard'),
  async execute(interaction) {
    /* const out_of_uses = !(await commandAccumulator(interaction, 'adminleaders', false, true));
    if (out_of_uses) return; */

    const { data } = await devAPI.getWeeklyLeaders();
    
    // Build Field Arrays
    var users = [];
    data.leaders.slice(0, 10).forEach((obj, i) => {
      users.push(
        (i + 1) + " - " +
        obj.username + " - " +
        "**`" +
        obj.keystrokes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        "`**" + " - " + obj.keystrokeTimestamp + ` **(${timeConversion(Date.now() - obj.keystrokeTimestamp) + ' ago'})**` + " - " + (obj.cheatAmount || "0") + " - " + (obj.cheatCount || "0")
      );
    });

    let emb = new EmbedBuilder()
      .setTitle(`[Admin] Leaderboard of ${new Date(+data.leaders[0].weekID).toLocaleDateString()}`)
      .addFields({ name: "Format", value: "place - username - filteredKeystrokes - lastSynced - cheatAmount - cheatCount" })
      .setDescription(users.join('\n'))
      .setColor("2f3136")
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/records/record_multi.gif`);

    await interaction.deferReply();
    return interaction.editReply({ embeds: [emb] });
  }
}
