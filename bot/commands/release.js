const { EmbedBuilder } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 };
const xpBot = require('./../utils/xpBot');
const { devAPI, discordAPI } = require("robo-bot-utils"); // Updated import for APIs
const env = process.env.env || 'staging'; // production or staging
const idKey = require('../utils/idKey');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a Pokémon')
    .addUserOption(option =>
      option
        .setName('pokemon')
        .setDescription('The Pokémon to release')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const pokemonDiscordId = interaction.options.getUser('pokemon').id;

    // Retrieve the guild and user information
    const guild = interaction.guild;
    const guildIDs = idKey[guild.id];

    // Check if the user owns the Pokémon
    let pokemonDiscordObj = await discordAPI.getUser(pokemonDiscordId).catch(e => {
      console.error(e);
      return false;
    });
    
    if (!pokemonDiscordObj || !pokemonDiscordObj.data || !pokemonDiscordObj.data.success) {
      return await interaction.reply(`<@${interaction.user.id}>, something went wrong!`);
    }

    let didntCaughtEmb = new EmbedBuilder()
      .setTitle("You haven't caught that Pokémon!")
      .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${interaction.user.id}>, you can't release Pokémon you haven't caught!`)
      .setColor(0x2f3136);

    if (pokemonDiscordObj.data.data.pokeOwner !== interaction.user.id) {
      return await interaction.reply({ embeds: [didntCaughtEmb] });
    }

    // Release Pokémon
    const releaseRes = await discordAPI.updateField(pokemonDiscordId, 'pokeOwner', 'wild');
    
    // Refund one Pokéball to the user
    await discordAPI.incrementField(interaction.user.id, 'pokeballCount', 'big_butt');

    let releaseEmb = new EmbedBuilder()
      .setTitle("You released a Pokémon!")
      .setDescription(`"Bye-bye", <@${interaction.user.id}> says as they release <@${pokemonDiscordId}> to the wild!`)
      .setColor(0x2f3136);
    
    return await interaction.reply({ embeds: [releaseEmb] });
  }
};
