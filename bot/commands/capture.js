const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 };
const xpBot = require('./../utils/xpBot');
const env = process.env.env || 'staging';
const { devAPI, discordAPI } = require("robo-bot-utils");
const { ids } = require('../ids');
let lastUserThrow = {};

const throwGifs = ['normalthrow'];
const catchSuccessGifs = ['normalcatch1', 'normalcatch2', 'normalcatch3'];
const catchFailGifs = ['normal_fail_1', 'normal_fail_2', 'normal_fail_3'];
let pokemon_limit = 5;
let pokeTypes = {
  "water": {
    "id": "water",
    "icon": "🌊",
    "strong_against": "fire",
    "weak_against": "plant"
  },
  "fire": {
    "id": "fire",
    "icon": "🔥",
    "strong_against": "plant",
    "weak_against": "water"
  },
  "plant": {
    "id": "plant",
    "icon": "🍃",
    "strong_against": "water",
    "weak_against": "fire"
  },
};

module.exports = {
  alias: ['capture'],
  data: new SlashCommandBuilder()
    .setName("capture")
    .setDescription("Attempt to capture another user as a Pokemon")
    .addUserOption(option => 
      option.setName("target")
        .setDescription("The user to capture")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client;
    const guild = interaction.guild;
    const guildIDs = ids[guild.id];
    let penalty = 75;

    if (lastUserThrow[interaction.user.id] && (Date.now() - lastUserThrow[interaction.user.id].time) < 30000) {
      return interaction.editReply(`<@${interaction.user.id}>, slow down!`+ `\n ${lastUserThrow[interaction.user.id] ? (30000 - (Date.now() - lastUserThrow[interaction.user.id].time))/1000 : 'Many'} seconds left!`);
    }

    if (interaction.channelId === guildIDs.graveyard) {
      let catchInGraveYardEmb = new EmbedBuilder()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`But you remember that you're in the fucking underworld, how do you even GET Pokeballs?`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [catchInGraveYardEmb] });
    }

    const userXP = (await xpBot.getXP(interaction.user.id))?.data;
    if (!userXP || userXP.discordXP < xpRequirement.xp) {
      let notEnoughXpEmb = new EmbedBuilder()
        .setTitle("Not enough XP!")
        .setDescription(`<a:red_siren:812813923522183208> Sorry, <@${interaction.user.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [notEnoughXpEmb] });
    }

    if (guild.members.cache.get(interaction.user.id).roles.cache.get(guildIDs.Ghost)) {
      let isGhostEmb = new EmbedBuilder()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, aren't you a ghost? You can't even pick up a Pokeball! Go haunt the server.`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [isGhostEmb] });
    }

    if (guild.members.cache.get(interaction.user.id).roles.cache.get(guildIDs.Dead)) {
      let deadEmb = new EmbedBuilder()
        .setTitle("You try to throw a Pokeball...")
        .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, aren't you dead? You can't capture Pokemon while dead!`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [deadEmb] });
    }

    const victim = interaction.options.getUser("target");
    if (!victim) {
      let noCaptureUserEmb = new EmbedBuilder()
        .setTitle("Please select a valid user!")
        .setDescription(`<a:red_siren:812813923522183208> Oops, you need to select someone to capture them!`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [noCaptureUserEmb] });
    }

    if (interaction.user.id === victim.id) {
      return interaction.editReply(`<@${interaction.user.id}> bangs their head against a pokeball and loses one of their last few braincells.`);
    }

    const wouldBeVictim = guild.members.cache.get(victim.id);
    let wouldBeVictimXP = (await xpBot.getXP(victim.id))?.data;

    if (!wouldBeVictim) {
      let invalidUserEmb = new EmbedBuilder()
        .setTitle("Please select a valid user!")
        .setDescription(`<a:red_siren:812813923522183208> Sorry, but you can't capture someone that doesn't exist! Select a valid user.`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [invalidUserEmb] });
    }

    if (wouldBeVictim.roles.cache.get(guildIDs.Dead)) {
      penalty = Math.max(0, Math.min(100, (penalty - 25)));
    }

    if (wouldBeVictim.roles.cache.get(guildIDs.Ghost)) {
      let ghostbusterEmb = new EmbedBuilder()
        .setTitle("You can't catch ghosts!")
        .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need a ghostbuster for that!`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [ghostbusterEmb] });
    }

    let thrower_discord_obj = await discordAPI.getUser(interaction.user.id);
    if (!thrower_discord_obj || !thrower_discord_obj.success) {
      return interaction.editReply(`<@${interaction.user.id}>, error grabbing your discord data.`);
    }
    thrower_discord_obj = thrower_discord_obj.data;

    let notEnoughPokeballsEmb = new EmbedBuilder()
      .setTitle("You don't have enough Pokeballs!")
      .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to buy more Pokeballs! Check the \`/store\`!`)
      .setColor("2f3136");
    if (!thrower_discord_obj.pokeballCount) {
      return interaction.editReply({ embeds: [notEnoughPokeballsEmb] });
    }

    lastUserThrow[interaction.user.id] = { time: Date.now() };

    let user_pokemon = await discordAPI.getUserPokemon(interaction.user.id);
    if (user_pokemon && user_pokemon.success && user_pokemon.data.Items && user_pokemon.data.data.Items.length >= pokemon_limit) {
      let maximumPokemonEmb = new EmbedBuilder()
        .setTitle("You have the maximum amount of Pokemon!")
        .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to \`/release\` one of your Pokemon to catch another!`)
        .setColor("2f3136");
      return interaction.editReply({ embeds: [maximumPokemonEmb] });
    }

    let victim_discord_obj = await discordAPI.getUser(victim.id);
    if (!victim_discord_obj || !victim_discord_obj.success) {
      return interaction.editReply(`<@${interaction.user.id}>, something went wrong!`);
    }
    victim_discord_obj = victim_discord_obj.data || {};

    if (victim_discord_obj.pokeOwner && victim_discord_obj.pokeOwner !== 'wild') {
      if (victim_discord_obj.pokeOwner === interaction.user.id) {
        return interaction.editReply(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, that's YOUR pokemon, dumbass!`);
      }
      let emb = new EmbedBuilder()
        .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, that user has already been caught by <@${victim_discord_obj.pokeOwner}>!`)
        .setColor('#cc2114');
      return interaction.editReply({ embeds: [emb] });
    }

    if (!victim_discord_obj || !victim_discord_obj.pokeType) {
      const pokeType = Object.values(pokeTypes)[Math.floor(Math.random() * Object.values(pokeTypes).length)].id;
      await discordAPI.updateField(victim.id, 'pokeType', pokeType);
      victim_discord_obj.pokeType = pokeType;
    }

    let deduct_ball = await discordAPI.deductField(interaction.user.id, 'pokeballCount', 'big_butt');
    if (!deduct_ball.success) {
      return interaction.editReply(`<@${interaction.user.id}>, something went wrong when using a pokeball!`);
    }

    const fighterXP = userXP.discordXP || 1;
    let victimXP = wouldBeVictimXP?.discordXP || 0;

    const calcWin = (victimXP, fighterXP) => {
      if (victimXP > fighterXP) {
        const chance = (((fighterXP + 1)/victimXP) / 2) - ((((fighterXP + 1)/victimXP) / 2) * (penalty/100));
        return {win: Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 };
      } else {
        const chance = (((victimXP + 1)/fighterXP) / 2) + ((((victimXP + 1)/fighterXP) / 2) * (penalty/100));
        return {win: Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 };
      }
    };

    const winObject = calcWin(victimXP, fighterXP);
    const win = winObject.win;
    const chanceToWinPretty = winObject.chance;

    if (win) {
      await discordAPI.updateField(victim.id, 'pokeOwner', interaction.user.id);
    }

    let emb = new EmbedBuilder()
      .setDescription(`<@${interaction.user.id}> is trying to capture <@${victim.id}>!`)
      .setAuthor({ name: interaction.user.username + ' threw a pokeball!', iconURL: interaction.user.avatarURL() })
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${throwGifs[Math.floor(Math.random() * throwGifs.length)]}.gif`)
      .setColor('#4ffcff');

    await interaction.editReply({ embeds: [emb] });

    setTimeout(async () => {
      let resultEmb;
      if (win) {
        const pokemonStats = `<@${victim.id}>'s stats
        ${pokeTypes[victim_discord_obj.pokeType].icon} *Type Pokemon*
        *Level* ${wouldBeVictimXP?.level || 0} // ${wouldBeVictimXP?.discordXP || 0} *XP*
        `;
        resultEmb = new EmbedBuilder()
          .setDescription(pokemonStats)
          .setAuthor({ name: `${interaction.user.username} caught a pokemon!`, iconURL: interaction.user.avatarURL() })
          .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${catchSuccessGifs[Math.floor(Math.random() * catchSuccessGifs.length)]}.gif`)
          .setFooter({ text: `${interaction.user.username} had a ${chanceToWinPretty}% chance to catch 'em!` })
          .setColor('3eaf7c');
      } else {
        resultEmb = new EmbedBuilder()
          .setDescription(`<@${victim.id}> escaped!`)
          .setAuthor({ name: `Catch failed!`, iconURL: interaction.user.avatarURL() })
          .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/${catchFailGifs[Math.floor(Math.random() * catchFailGifs.length)]}.gif`)
          .setFooter({ text: `${interaction.user.username} had a ${chanceToWinPretty}% chance to catch 'em!` })
          .setColor('da3b3b');
      }

      await interaction.channel.send({ embeds: [resultEmb] });
    }, 3000);
  }
};