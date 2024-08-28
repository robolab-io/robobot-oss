const codeTips = require('../static/codeTips')
const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  alias: ['rolecount'],
  data: new SlashCommandBuilder()
    .setName("rolecount")
    .setDescription("Count the number of users in a role")
    .addRoleOption(option => 
      option.setName("role")
        .setDescription("The role to count")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    if (!role) {
      let doesntExistEmbed = new EmbedBuilder()
        .setColor(`2f3136`)
        .setDescription(" You didn't provide a **valid role**.")
      return interaction.reply({ embeds: [doesntExistEmbed] });
    }

    const count = role.members.size;
    if (count < 100) {console.log(role.members.map(x => x.id));}  

    var embed = new EmbedBuilder()
      .setTitle(`There are **${count}** users in the **${role.name}** role.`)
      .setColor(`2f3136`);
    
    interaction.reply({ embeds: [embed] });
  }
}