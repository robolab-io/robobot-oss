const { SlashCommandBuilder } = require('discord.js');
const { getEntities, getFlavor, getMedia } = require("./helpers").mcDeathHelp;
const { flavorFuncs } = require('./deathFlavor');

// bot/passive/mcDeath/deathFlavor.js
module.exports = {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('Kill a user with a custom death message')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to kill')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('media')
        .setDescription('The type of media to use (default: img)')
        .addChoices(
          { name: 'Image', value: 'img' },
          { name: 'Text', value: 'text' }
        )),

  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getUser('target');
    const media = interaction.options.getString('media') || 'img';

    const obj = {
      author: interaction.user,
      mentions: { users: new Map([[target.id, target]]) },
      guild: interaction.guild
    };

    const { media: mediaContent, ...constObj } = await getEntities(obj, 'interaction', media);
    
    const flavor = getFlavor(flavorFuncs, constObj);
    
    const joined = constObj.getUser.joinedAt;
    const score = `${Math.sqrt((Date.now() - joined) / 1000) | 0}`;
    
    const content = await getMedia(mediaContent, constObj, flavor, score);
    
    await interaction.editReply(content);
  }
};