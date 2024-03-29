const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { static } = require("robo-bot-utils");

const { ch_general, dev_bot, dev_feed } = require('../ids')
const events = require("../server/events");
const createEvent = require("../server/createEvent");
const commandAccumulator = require("../utils/commandAccumulator");


function weightedRandom(arr) {
  let sum = 0,
    r = Math.random() * 100;
  return arr
    .map((x) => {
      sum += x.chance;
      if (r <= sum) {
        return x;
      }
    })
    .filter((x) => x)[0];
}

function roundTimeToMinute(time, roundMin) {
  var coeff = 1000 * 60 * roundMin;
  var rounded = new Date(Math.round(time / coeff) * coeff).getTime();
  return rounded;
}

const general_channels = [ ch_general, dev_bot, dev_feed ]
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  alias: ['p'],
  data: new SlashCommandBuilder()
    .setName("pray")
    .setDescription("Pray to Robo-bot for something special!"),

  async execute(interaction) {
    await interaction.deferReply();

    if (!general_channels.includes(interaction.channel.id)) {
      let notGeneralChannelEmb = new EmbedBuilder()
        .setDescription(
          `<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to use pray in a public channel like <#${ch_general}>!`
        )
        .setColor("2f3136");
      return await interaction.editReply({ embeds: [notGeneralChannelEmb] });
    }

    const out_of_uses = !(await commandAccumulator(
      interaction,
      "pray",
      false,
      true
    ));
    if (out_of_uses) return;

    const eventTimeType = weightedRandom(static.mappings.pray_mappings);
    if (eventTimeType.event === "nothing") {
      return interaction.editReply(
        static.flavors.pray.nothing_flavors[
          Math.floor(Math.random() * static.flavors.pray.nothing_flavors.length)
        ]
      );
    }
    const eventScriptType = weightedRandom(
      static.mappings.pray_chances[eventTimeType.event]
    );
    console.log(eventScriptType);

    if (eventTimeType.event === "instant") {
      interaction.editReply(
        static.flavors.pray.instant_flavors[
          Math.floor(Math.random() * static.flavors.pray.instant_flavors.length)
        ]
      );
      events.roboEvent(interaction.client, {
        guildID: interaction.guild.id,
        channelID: interaction.channel.id,
        eventType: eventScriptType.event,
        eventMappingOverrides: { addPrewatchTime: 3000 },
      });
    }

    if (eventTimeType.event === "delayed") {
      interaction.editReply(
        static.flavors.pray.delayed_flavors[
          Math.floor(Math.random() * static.flavors.pray.delayed_flavors.length)
        ]
      );
      const futureTime = roundTimeToMinute(
        Date.now() + getRandomInt(120000, 86400000),
        6
      );

      createEvent.roboEventInFuture(
        interaction.guild.id,
        interaction.channel.id,
        eventScriptType.event,
        futureTime,
        { addPrewatchTime: 22000 }
      );
    }

    if (eventTimeType.event === "nothing") {
      interaction.editReply("Nothing happens...");
    }
  },
};
