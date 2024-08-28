const { EmbedBuilder } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('../utils/xpBot')
const { devAPI, discordAPI } = require("robo-bot-utils");
const env = process.env.env || 'staging' // production or staging
const { SlashCommandBuilder } = require("discord.js");
const { ids } = require('../ids')
const store_greetings = [
  `Ahaha yes! Welcome to my color store!`,
  'Come on in! We love colors here!',
  'It\'s looking fabulous in here!',
  'Time for a makeover? You look hideous!',
  'Yes, I sell colors now. Times are hard!',
  'Expensive doesn\'t mean better!',
  'Come on in and buy a color! It\'s fun!'
]

module.exports = {
  alias: ['rolestore'],
  data: new SlashCommandBuilder()
    .setName("rolestore")
    .setDescription("View the color store"),

  async execute(interaction) {
    // check xp requirement
    const userXP = (await xpBot.getXP(interaction.user.id))?.data
    if (!userXP || userXP.discordXP < xpRequirement.xp) {
      return interaction.reply(`Sorry, <@${interaction.user.id}>! You need to be \`level ${xpRequirement.level}\` to do that!`)
    }

    let store_flavor = store_greetings[Math.floor(Math.random() * store_greetings.length)];
    let description = `
    ${store_flavor}

    To buy, use \`/buy colorname\`.
    Remember, you can only have one color at a time! Buying overwrites other colors you bought, and you will have to re-buy!

    ╚════════════════════╝
    `
    let emb = new EmbedBuilder()  
      .setDescription(description)
      .setImage('https://mechakeys.robolab.io/discord/media/store/rolecolors.png')
      .setTitle(`╔═<:keycapsBag:755519849345843240>Color Shop☩═<:keycapsBag:755519849345843240>═╗`)
      .setFooter({ text: 'Example: /buy axios green' })
      .setThumbnail(`https://mechakeys.robolab.io/discord/media/pokemon/shopkeep.png`)
      .setColor('#ffaf24')
    
    await interaction.reply({ embeds: [emb] })
  }
}