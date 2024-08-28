const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 }
const xpBot = require('./../utils/xpBot')
const { devAPI, discordAPI } = require("robo-bot-utils")
const env = process.env.env || 'staging' // production or staging
const idKey = require('../ids')
const commandLimiter = require('./../utils/commandLimiter');
const { messageFromThePast } = require("../utils/events");

// Embed Builders
const gameoverEmbed = new EmbedBuilder()
  .setTitle('Game over.')
  .setColor('#ffc948')
  .setImage('https://mechakeys.robolab.io/discord/media/tumblebounce/riptumble.gif')
  .setDescription(`The tumbleweed hit the ground and died.`)

const statsEmbedNoReward = new EmbedBuilder()
  .setTitle('Tumblebounce game stats & rewards.')
  .setColor('#ffc948')
  .setDescription(`**This tumblebounce ended with a save. This means that stats were not saved for this! Use the save better, next time!**`)

// Save remote tumbleweed
const save_remote_tumbleweed = async (guildID, key, value) => {
  const saveRes = await discordAPI.setGuildField(guildID, key, value);
  return saveRes;
}

module.exports.tumblebounceSave = async (interaction, { args, client, currentGames, channelID }) => {
  const inactiveTumblebounceEmbed = new EmbedBuilder()
    .setTitle("Tumblebounce is inactive!")
    .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${interaction.user.id}>! You can't save a tumbleweed that doesn't even exist yet!`)
    .setColor("2f3136");

  const tumblebounceInAirEmbed = new EmbedBuilder()
    .setTitle("Tumbleweed is in the air!")
    .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${interaction.user.id}>! This tumbleweed needs to be falling in to use the Flying Fist!`)
    .setColor("2f3136");

  const fakeFallingEmbed = new EmbedBuilder()
    .setTitle(`The tumbleweed is coming back down!`)
    .setThumbnail(`https://mechakeys.robolab.io/discord/media/tumblebounce/Falling.gif`)
    .setColor('#ffc948')
    .setDescription(`
      Hit it back up before it hits the ground!
      To hit the tumbleweed, send any <:tumbleweed:702482059095965706> tumbleweed emoji.
    `);

  function scuffedGetRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  if (!currentGames[interaction.channel.id] || !currentGames[interaction.channel.id].tumblebounce) {
    await interaction.reply({ embeds: [inactiveTumblebounceEmbed] });
    return;
  }

  const tumblebounce = currentGames[interaction.channel.id].tumblebounce;

  if (tumblebounce.needTouch === false) {
    await interaction.reply({ embeds: [tumblebounceInAirEmbed] });
    return;
  }

  if (commandLimiter(interaction)) return;

  const userXP = await xpBot.getXP(interaction.user.id);
  if (!userXP || userXP.discordXP < xpRequirement.xp) {
    const notEnoughXpEmb = new EmbedBuilder()
      .setTitle("Not enough XP!")
      .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${interaction.user.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
      .setColor("2f3136");
    return await interaction.reply({ embeds: [notEnoughXpEmb] });
  }

  const guild = client.guilds.cache.get(interaction.guild.id);
  const authorUser = guild.members.cache.get(interaction.user.id);

  if (authorUser.roles.cache.has('939774831220633600')) {
    await authorUser.roles.remove('939774831220633600');
  } else {
    return await interaction.reply('You need a Flying Fist in order to save this tumbleweed from falling! Buy one at the `>store`!');
  }

  tumblebounce.needTouch = false;
  let randompower = scuffedGetRandom(10, 150);
  let timeInAir = Math.round(randompower - (randompower * 0.1));
  tumblebounce.return_time = Date.now() + timeInAir * 1000;
  await save_remote_tumbleweed(interaction.guild.id, `c_${env}_${interaction.channel.id}_tumblebounce`, tumblebounce);

  setTimeout(() => {
    currentGames[interaction.channel.id].tumblebounce.needTouch = true;
    currentGames[interaction.channel.id].tumblebounce.needTouchTime = Date.now();
    interaction.followUp({ embeds: [fakeFallingEmbed] });
  }, timeInAir * 1000);

  const savedEmbed = new EmbedBuilder()
    .setTitle("Tumbleweed SAVED!")
    .setDescription("Your Flying Fist shoots off your hand and SMACKS that tumbleweed back into space.")
    .setFooter({ text: "No one knows when it'll come back, get ready!" })
    .setThumbnail('https://mechakeys.robolab.io/discord/media/tumblebounce/GreatHit.gif')
    .setColor("ffc848");

  await interaction.followUp({ embeds: [savedEmbed] });
};
