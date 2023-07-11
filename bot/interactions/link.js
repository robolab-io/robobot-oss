const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")

module.exports = (client) => {
  client.on("interactionCreate", (interaction) => {
    if (!interaction.isButton()) return;

    const linkModal = new ModalBuilder()
      .setCustomId("linkModal")
      .setTitle("Link your MechaKeys account to Discord");

    const mechakeysUsernameInput = new TextInputBuilder()
      .setCustomId("mechakeysUsernameInput")
      .setLabel("What's your MechaKeys username?")
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(24)
      .setPlaceholder("Case-sensitive")
      .setRequired(true);

    const modalActionRow = new ActionRowBuilder().addComponents(
      mechakeysUsernameInput
    );
    linkModal.addComponents(modalActionRow);

    interaction.showModal(linkModal);
  })
}