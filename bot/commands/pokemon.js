const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { discordAPI } = require("robo-bot-utils");

const xpRequirement = { xp: 2000 };
const xpBot = require("../utils/xpBot");


let pokeTypes = {
  water: {
    id: "water",
    icon: "🌊",
    strong_against: "fire",
    weak_against: "plant",
  },
  fire: {
    id: "fire",
    icon: "🔥",
    strong_against: "plant",
    weak_against: "water",
  },
  plant: {
    id: "plant",
    icon: "🍃",
    strong_against: "water",
    weak_against: "fire",
  },
  undefined: {
    id: "null",
    icon: "❓",
    strong_against: "nothing",
    weak_against: "nothing",
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pokemon")
    .setDescription("View your Pokemon"),

  async execute(interaction) {
    await interaction.deferReply();

    const currentXP = await xpBot.getXP(interaction.user.id);

    const neededXP = Math.round(xpRequirement.xp - currentXP)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!currentXP || currentXP < xpRequirement.xp) {
      let notEnoughXPEmbed = new EmbedBuilder()
        .setTitle("Not enough XP!")
        .setDescription(
          `<a:red_siren:812813923522183208> You do not have enough XP to perform this action. You need ${neededXP} more XP.`
        )
        .setColor("2f3136");

      return interaction.editReply({
        embeds: [notEnoughXPEmbed],
        ephemeral: true,
      });
    }

    let user_pokemon = await discordAPI.getPokemon(interaction.user.id);
    if (
      !user_pokemon ||
      !user_pokemon.data ||
      !user_pokemon.success ||
      !user_pokemon.data.Items.length
    ) {
      return interaction.editReply({
        content: `<@${interaction.user.id}>, you don't have any Pokemon!`,
      });
    }

    let pokemon = user_pokemon.data.Items;

    let pokemonInfo = await Promise.all(
      pokemon.map(async (x) => {
        const userXP = await xpBot.getXP(x.discordID);
        return {
          id: x.discordID,
          userXP,
          type: x.pokeType,
        };
      })
    );

    let description = "";
    pokemonInfo.forEach((element) => {
      if (element) {
        description += `${pokeTypes[element.type].icon} Lvl ${
          element.userXP.level || 0
        } ║ ${
          element.userXP
            ? element.userXP?.data?.discordXP
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : 0
        } xp ║ <@${element.id}>\n`;
      }
    });

    let pokemonEmbed = new EmbedBuilder()
      .setDescription(description)
      .setThumbnail(
        "https://mechakeys.robolab.io/discord/media/pokemon/pokedex.png"
      )
      .setColor("3eaf7c");

    await interaction.editReply({ embeds: [pokemonEmbed] });
  },
};
