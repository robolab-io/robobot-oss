const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const { static } = require("robo-bot-utils");

const xpBot = require("../utils/xpBot");
const recordUtil = require("../utils/records");

const xpRequirement = { xp: 850, level: 6 };

function timeConversion(millisec) {
  let seconds = Math.round(millisec / 1000);
  let minutes = Math.round(millisec / (1000 * 60));
  let hours = Math.round(millisec / (1000 * 60 * 60));
  let days = Math.round(millisec / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return seconds + " seconds";
  } else if (minutes < 60) {
    return minutes + " minutes";
  } else if (hours < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
}

const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("records")
    .setDescription("View the all-time Hall of Fame of MechaKeys"),

  async execute(interaction) {
    await interaction.deferReply();

    const userXP = await xpBot.getXP(interaction.user.id);

    const neededXP = Math.round(xpRequirement.xp - userXP)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!userXP || userXP < xpRequirement.xp) {
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

    // get records
    const record_objs = recordUtil.record_list(interaction.guild.id);
    const record_map = convertArrayToObject(record_objs, "record_id");
    const record_ids = record_objs.map((x) => x.record_id);
    const category_array = [
      ...new Set(record_objs.map((x) => x.record_info.category)),
    ];
    const all_records_res = await axios.post(
      `${static.endpoints.discord}/?action=getAllRecords`,
      { record_ids }
    );
    const all_records = all_records_res.data.data.records;
    all_records.map((x) => {
      record_map[x.discordID].current_record = x;
    });

    const record_lines = category_array.map((cat) => {
      const current_cat = Object.values(record_map).filter(
        (x) => x.record_info.category === cat
      );
      const cat_strings = current_cat
        .map((x) => {
          if (x.current_record) {
            return `${x.record_info.label}\n${x.record_info.displayValue(
              x.current_record.fieldValue
            )} | by <@${x.current_record.userID}>, *${timeConversion(
              Date.now() - x.current_record.record_time
            )} ago*`;
          } else {
            return false;
          }
        })
        .filter((x) => x);
      if (!cat_strings.length) {
        return "";
      } else {
        return `**${cat}**\n┈┈┈┈┈\n${cat_strings.join("\n")}\n`;
      }
    });

    let emb = new EmbedBuilder()
      .setTitle("Server Records")
      .setDescription(`${record_lines}`)
      .setThumbnail(
        "https://mechakeys.robolab.io/discord/media/records/record_multi.gif"
      );

    await interaction.editReply({ embeds: [emb] });
  },
};
