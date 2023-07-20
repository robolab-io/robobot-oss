const { EmbedBuilder } = require("discord.js")

const { ch_general } = require('../../ids')

const { gifs } = require('./flavor')

const dailyEmbed = ({description, interaction, jackpot, jackpot_descriptor, rewardToGive})=>{
  return new EmbedBuilder()
    .setDescription(description)
    .setAuthor({
      name: interaction.user.username + " collected a daily reward!",
      iconURL: interaction.user.avatarURL(),
    })
    .setThumbnail(
      jackpot.winnings
        ? `https://mechakeys.robolab.io/discord/media/jackpot/jackpot_${jackpot_descriptor}.gif`
        : gifs[rewardToGive][
            Math.floor(Math.random() * gifs[rewardToGive].length)
          ]
    )
    .setColor("#c62783")
}

const notGeneralChannelEmbFn = ({interaction}) => {
  return new EmbedBuilder()
    .setDescription(
      `<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to use daily in a public channel like <#${ch_general}>!`
    )
    .setColor("2f3136")
}

module.exports = {
  dailyEmbed,
  notGeneralChannelEmbFn
}
