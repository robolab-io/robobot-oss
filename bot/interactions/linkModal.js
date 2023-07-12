const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const { static } = require("robo-bot-utils");
const { SERVER_ID, log_api } = require('../ids')

const { isLinked_username } = require('../utils/isLinked')
function onlyAlphanumeric(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    const mechakeysUsernameInputValue = interaction.fields.getTextInputValue( "mechakeysUsernameInput" );
    const cleanedValue = onlyAlphanumeric(mechakeysUsernameInputValue);

    const userID = interaction.user.id;
    const discordUsername = encodeURIComponent(interaction.user.username);

    console.log(
      `[linking] ${userID} (discord username ${discordUsername}) linked to mechakeys user ${cleanedValue}`
    );

    const guild = interaction.client.guilds.cache.get(SERVER_ID);
    const apiLogChannel = guild.channels.cache.get(log_api);

    const embed = new EmbedBuilder()
      .setTitle("User attempted to link account")
      .setColor("#2bffb8")
      .setDescription(
        `<@${userID}> (${userID}) attempted to link to MechaKeys user ${cleanedValue}`
      );
    apiLogChannel.send({ embeds: [embed] });

    const link = `${static.endpoints.developer}/?action=linkUserDiscord&discordID=${userID}&discordUsername=${discordUsername}&mechakeysUsername=${cleanedValue}`;
    const res = await axios.get(link);

    let notFound = new EmbedBuilder()
      .setColor("ff0000")
      .setDescription(
        `**${cleanedValue}** either does not exist, or you are already linked to an account. Check your spelling and __CaPiTaLiZe everything correctly__.`
      );

    let notFoundToLog = new EmbedBuilder()
      .setColor("ff0000")
      .setDescription(
        `<@${userID}> tried to link to **${cleanedValue}**, but they are already linked, or the account does not exist.`
      );

    const notFoundToLogRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Check MechaKeys Username via devAPI")
        .setURL(
          `${static.endpoints.developer}/?action=getUser&username=${cleanedValue}`
        )
        .setStyle(ButtonStyle.Link)
    );

    let success = new EmbedBuilder()
      .setColor("2f3136")
      .setDescription(
        `# Last step: check your email! \n<@${userID}>, **check your email and click the link inside** to finish linking your MechaKeys account.`
      );

    let userAlreadyLinkedCheck = await isLinked_username(cleanedValue);

    let alreadyLinked = new EmbedBuilder()
      .setColor("ff0000")
      .setDescription(
        `**${cleanedValue}** is already linked to a Discord account. You cannot link to another account, and you cannot unlink accounts.`
      );

    let alreadyLinkedToLog = new EmbedBuilder()
      .setColor("ff0000")
      .setDescription(
        `<@${userID}> tried to link to **${cleanedValue}**, which is already linked to a Discord account.`
      );

    if (userAlreadyLinkedCheck === true) {
      apiLogChannel.send({ embeds: [alreadyLinkedToLog] });

      return interaction.reply({ embeds: [alreadyLinked], ephemeral: true });
    }

    if (!res || !res.data || !res.data.success) {
      console.log("[linking]");
      console.log({ mechakeysUsernameInputValue });
      console.log(
        `[linking] ${mechakeysUsernameInputValue} was attempted to be linked to, but does not exist, or Discord user is already linked.`
      );
      apiLogChannel.send({
        embeds: [notFoundToLog],
        components: [notFoundToLogRow],
      });
      return interaction.reply({ embeds: [notFound], ephemeral: true });
    }

    interaction.reply({ embeds: [success], ephemeral: true });
  });
}