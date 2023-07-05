const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { devAPI } = require("robo-bot-utils");

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
    return days + " days";
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminprofile")
    .setDescription("Developer-only - View detailed data about a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The person you want to view")
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let userArgument = interaction.options.getUser("user");
    let user;

    if (userArgument) {
      user = userArgument.id;
    } else {
      user = interaction.user.id;
    }

    let query;
    const discordIdData = await devAPI.getUserByDiscordID(user);
    query = discordIdData.data.username;

    if (!discordIdData || !discordIdData.success) {
      let doesntExistEmbed = new EmbedBuilder()
        .setColor("2f3136")
        .setDescription(
          `<a:red_siren:812813923522183208> <@${user}> needs to link their account to view keystrokes!`
        );
      return interaction.editReply({ embeds: [doesntExistEmbed] });
    }

    const { data } = await devAPI.getUser(query);

    const avatarName = data.avatar || "icon";
    // if user has avatar, save it, or go to default

    let description = `**${query} Keystrokes**: \`${
      data && data.keystrokes && !!Number(data.keystrokes)
        ? data.keystrokes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        : "zero"
    }\`
        **${query} Last Synced**: \`${
      timeConversion(Date.now() - data.keystrokeTimestamp) + " ago"
    }\` || \`${data.keystrokeTimestamp}\`
        **${query} Avatar Code**: \`${data.avatar || "default"}\`
        **${query} Keycaps**: \`${data.coins}\`
        **${query} Keycaps Bought**: \`${data.coinsBought || 0}\`
        **${query} Gottee**: \`${data.crackCount || 0}\`
        **${query} Linked**: \`${data.discordLink_1 ? "Yes" : "No"}\`
        **${query} Achievements JSON**: \`\`\`${data.achievements}\`\`\``;
    if (data.registered_at) {
      description += `**Registered:** ${new Date(data.registered_at)}`;
    }

    let profileEmbed = new EmbedBuilder()
      .setDescription(description)
      .setColor("2f3136")
      .setThumbnail(
        `https://mechakeys.robolab.io/app/avatars/${avatarName}.png`
      )
      .setFooter({ text: "Data is from" })
      .setTimestamp();
    // if (!data || !data.success) {
    //     console.log(data)
    //     emb.setDescription(data.message || 'There was an error.')
    //     return msg.channel.send(emb || 'There was an error.');
    // }

    return interaction.editReply({ embeds: [profileEmbed] });
  },
};
