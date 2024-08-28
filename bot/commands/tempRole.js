const parseDuration = require('parse-duration')
const createEvent = require('.././utils/createEvent')
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

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

module.exports = {
  alias: ['temprole'],
  data: new SlashCommandBuilder()
    .setName("temprole")
    .setDescription("Give a user a temporary role")
    .addStringOption(option => 
      option.setName("role")
        .setDescription("The role to give (ID or name)")
        .setRequired(true)
    )
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to give the role to")
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName("duration")
        .setDescription("The duration of the temporary role")
        .setRequired(true)
    ),

  async execute(interaction) {
    let roleInput = interaction.options.getString("role");
    let userObj = interaction.options.getMember("user");
    let durationInput = interaction.options.getString("duration");

    let roleID = isNaN(roleInput) ? roleMap[roleInput.toLowerCase()] : roleInput;

    if (!roleID) {
      let notARoleEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(" Role name not supported. Use the ID instead.");
      return interaction.reply({ embeds: [notARoleEmbed] });
    }

    try {
      await userObj.roles.add(roleID);
    } catch (error) {
      console.error(error);
      return interaction.reply("Failed to add the role. Make sure the role exists and the bot has the necessary permissions.");
    }

    const duration = parseDuration(durationInput);

    createEvent.removeRole(interaction.guild.id, userObj.id, roleID, duration);
    
    return interaction.reply({
      content: `<@${userObj.id}> given \`<@&${roleID}>\` for ${timeConversion(duration)}!`,
      allowedMentions: { parse: [] }
    });
  }
}