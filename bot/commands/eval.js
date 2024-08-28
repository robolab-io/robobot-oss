
const { MessageEmbed } = require("discord.js");
const util = require("util");

function clean(text) {
  if (typeof text === "string") {
    return text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203));
  } else { return text };
}

function evalEmbed(code, output) {
  return new MessageEmbed()
    .setColor("#FFFFFF")
    .addField(":inbox_tray: Input: ", `\`\`\`${code}\`\`\``)
    .addField(":outbox_tray: Output: ",`\`\`\`${clean(output)}\`\`\``)
}

function sendFile(msg, output) {
  msg.channel.send(
    "Output exceeded 1024 characters. Output will be sent as file", 
    { files: [{
        attachment: Buffer.from(output),
        name: "output.txt"
      }]
    }
  )
}

// Please break this up into more defined chunks
module.exports.mkEval = (msg, 
  { 
    /*Variables:*/ args, client, cmds, developerAPI, cache, mentions, currentGames,
    /*Functions:*/ addRole, getMember, getMention, tmpMsg
  }
) => {
  var code = args.join(" ");
  if (!code) {
    return msg.channel.send(`You didn't provide any input.`);
  }


  // if (code.includes('require')||code.includes('import')||code.includes('module.constructor._load')) {
  //   return msg.channel.send(`no imports aloud u H4x0r!`);
  // }

  try {
    const { guild, members, roles, emojis, channels, guilds, users } = cache

    var evaled = eval(code);
    if (typeof evaled !== "string") evaled = util.inspect(evaled);
    const checkCharLength = clean(evaled);
    if (code === clean(evaled))
      return msg.channel.send("The input was the same as the output.");

    const MAX_CHARS = 3 + 2 + checkCharLength.length + 3;
    if (MAX_CHARS > 1023) {
      sendFile(msg, checkCharLength)
    }
    msg.channel.send(evalEmbed(code, evaled));
  } catch (err) {
    if (err.message.length > 1023) {
      sendFile(msg, err.msg)
    } 
    msg.channel.send(evalEmbed(code, err.msg));
  }
}
