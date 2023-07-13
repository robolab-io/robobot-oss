const { EmbedBuilder } = require("discord.js")

const { discordAPI } = require("robo-bot-utils")

const { 
  Staff_Admin_CMDS, Role_Donator, Staff_Helper, Role_Linked, Staff_Mod 
} = require('../ids')


const role_map = {
  [Staff_Admin_CMDS] : {
    debug: {
      rate: 0.02,
      cap: 99,
    },
    giveaway: {
      rate: 0.02, // every 1 hour (3600000 ms)
      cap: 99,
    },
    bombsquad: {
      rate: 0.02, // every 2 hour (3600000 ms)
      cap: 99,
    },
    tumblebounce: {
      rate: 1, // every 24 hours
      cap: 1,
    },
    fight: {
      rate: 0.02, // every 0.5 hours
      cap: 99,
    },
    secretpepe: {
      rate: 0.02, // every 24 hours
      cap: 99,
    },
    pray: {
      rate: 0.02,
      cap: 1,
    },
    tip: {
      rate: 0.002,
      cap: 99,
    },
    suggest: {
      rate: 0.02,
      cap: 99,
    },
  },

  [Staff_Mod]: {
    bombsquad: {
      rate: 2, // every 2 hours
      cap: 3,
    },
    giveaway: {
      rate: 24, // every 24 hour (3600000 ms)
      cap: 1,
    },
    tumblebounce: {
      rate: 6, // every 6 hours
      cap: 2,
    },
    secretpepe: {
      rate: 12, // every 12 hours
      cap: 6,
    },
    fight: {
      rate: 0.5, // every 0.5 hours
      cap: 3,
    },
    pray: {
      rate: 0.5,
      cap: 1,
    },
    tip: {
      rate: 0.02,
      cap: 10,
    },
    suggest: {
      rate: 6,
      cap: 2,
    },
  },

  [Role_Donator]: {
    bombsquad: {
      rate: 12, // every 12 hours
      cap: 2,
    },
    giveaway: {
      rate: 24, // every 24 hour (3600000 ms)
      cap: 1,
    },
    tumblebounce: {
      rate: 8, // every 8 hours
      cap: 1,
    },
    secretpepe: {
      rate: 6, // every 6 hours
      cap: 2,
    },
    fight: {
      rate: 0.6,
      cap: 3,
    },
    pray: {
      rate: 1,
      cap: 1,
    },
    tip: {
      rate: 0.02,
      cap: 5,
    },
    suggest: {
      rate: 6,
      cap: 2,
    },
  },

  [Staff_Helper]: {
    bombsquad: {
      rate: 24, // every 24 hours
      cap: 2,
    },
    giveaway: {
      rate: 730, // every month (3600000 ms)
      cap: 1,
    },
    tumblebounce: {
      rate: 62, // every 62 hours
      cap: 2,
    },
    secretpepe: {
      rate: 24, // every 24 hours
      cap: 2,
    },
    fight: {
      rate: 0.7, // every 0.7 hours
      cap: 2,
    },
    pray: {
      rate: 2,
      cap: 1,
    },
    tip: {
      rate: 0.02,
      cap: 1,
    },
    suggest: {
      rate: 6,
      cap: 2,
    },
  },

  [Role_Linked]: {
    bombsquad: {
      rate: 99999999, // every 12 hours
      cap: 0,
    },
    giveaway: {
      rate: 99999999, // every 24 hour (3600000 ms)
      cap: 0,
    },
    tumblebounce: {
      rate: 99999999, // every 8 hours
      cap: 0,
    },
    secretpepe: {
      rate: 99999999, // every 6 hours
      cap: 0,
    },
    fight: {
      rate: 0.8,
      cap: 2,
    },
    pray: {
      rate: 2,
      cap: 1,
    },
    tip: {
      rate: 0.08,
      cap: 1,
    },
    suggest: {
      rate: 6,
      cap: 2,
    }
  }
};

const wait_flavor = (user, time) => {
  const flavors = [
    `${user}, please take a chill pill and use the command again in \`${time}\`.`,
    `${user}, you're out of charges! Next charge in: \`${time}\`.`,
    `${user}, g-g-g-gGOTEEEEE! You can't use that command anymore! Please wait \`${time}\`.`,
    `${user}, you're using commands too fast! Wait \`${time}\` before doing that again.`,
    `${user}, I, Robo-bot, lord of all bots, had to stop you from doing that command! Try again in \`${time}\`.`,
    `${user}, \`${time}\` must pass before doing that command again!`,
    `${user}, try playing Tumblebounce for \`${time}\` before doing that command again!`,
  ];
  return flavors[Math.floor(Math.random() * flavors.length)];
};

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
module.exports = async (interaction, type, readonly, isInteraction) => {
  let commandNotFoundEmbed = new EmbedBuilder()
    .setColor("2f3136")
    .setDescription(
      `<a:red_siren:812813923522183208> You need to supply a command to see your quota, dingus. Try these:\n\`${Object.keys(
        role_map[Staff_Helper]
      ).join(", ")}\``
    );

  if (!Object.keys(role_map[Staff_Helper]).includes(type)) {
    if (readonly) {
      if (isInteraction) {
        interaction.editReply({ embeds: [commandNotFoundEmbed] });
      } else {
        interaction.reply({ embeds: [commandNotFoundEmbed] });
      }
      return false;
    } else {
      interaction.editReply(
        "Err... error... command not found? You shouldn't be seeing this! AAAHHH! `CODE:ERROR_CA`"
      );
      return false;
    }
  }
  const id = isInteraction ? interaction.user.id : interaction.author.id;
  
  const authorUser = interaction.guild.members.cache.get(id);
  const highestRole = Object.keys(role_map).find((x) =>
    authorUser.roles.cache.get(x)
  );
  if (!highestRole) {
    if (isInteraction) {
      interaction.editReply({
        content: "Begone, peasant! You don't have access to this command!",
      });
      return false;
    } else {
      interaction.reply({
        content: "Begone, peasant! You don't have access to this command!",
      });
      return false;
    }
  }
  // check for key roles
  // assume user is highest role
  // for command type, check last_${type}_time AND count
  // Do this math to see how much they SHOULD have based on command accumulate rate
  const userCommandInfo = await discordAPI.getCmdInfo(id, type);
  console.log('userCommandInfo:', userCommandInfo)
  const last_type_time = userCommandInfo.data?.[`${type}_last_time`] ?? 0;
  let type_amount = userCommandInfo.data?.[`${type}_amount`] ?? 0;
  console.log('last_type_time / type_amount:', last_type_time, type_amount)
  const accumulated_raw =
    (Date.now() - last_type_time) /
    (role_map[highestRole][type].rate * 3600000); // how many they've generated since last use
  const accumulated = Math.min(
    // limit to cap
    Math.floor(
      // round down to nearest integer
      accumulated_raw
    ),
    role_map[highestRole][type].cap
  );
  type_amount =
    Math.min(type_amount + accumulated, role_map[highestRole][type].cap) - 1; // minus 1 because we just used it
  if (!readonly && type_amount < 0) {
    if (isInteraction) {
      interaction.editReply(
        wait_flavor(
          `<@${interaction.user.id}>`,
          timeConversion(
            (1 - accumulated_raw) *
              role_map[highestRole][type].rate *
              60 *
              60 *
              1000
          )
        )
      );
      return false;
    } else {
      interaction.reply(
        wait_flavor(
          `<@${interaction.author.id}>`,
          timeConversion(
            (1 - accumulated_raw) *
              role_map[highestRole][type].rate *
              60 *
              60 *
              1000
          )
        )
      );
      return false;
    }
  }
  if (readonly) {
    let quotaEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setDescription(
        `**${type.charAt(0).toUpperCase() + type.slice(1)}**: \`${
          type_amount + 1
        }\` remaining\n**Recharge Rate**: \`${
          role_map[highestRole][type].rate
        } hours\`\n**Command Cap**: \`${role_map[highestRole][type].cap}\``
      );

    if (isInteraction) {
      interaction.editReply({ embeds: [quotaEmbed] });
    } else {
      interaction.reply({ embeds: [quotaEmbed] });
    }
  } else {
    // update DB with new time and amount
    await discordAPI.setCmdInfo(id, { type_amount: type_amount, type: type });
  }
  return true;
};
