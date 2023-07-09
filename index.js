/** *   IMPORTS   ***/
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
} = require("discord.js");
const { ModalBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const {
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { ButtonBuilder, ButtonStyle } = require("discord.js");

const fs = require("fs");
const axios = require("axios");

const env = process.env.env || "staging"; // production or staging
const { devAPI, discordAPI, static, TOKEN, isDev } = require("robo-bot-utils");

/** *   CORE   ***/
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [
    Partials.User,
    Partials.GuildMember,
    Partials.ThreadMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
  ],
});

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const { init, logs } = require("./bot/apiLog")(app, client);
init();
logs();

const { initCache } = require("./bot/utils/getCache");
const methods = {
  addRole: require("./bot/utils/addRole"),
  getMember: require("./bot/utils/getMember"),
  getMention: require("./bot/utils/getMention"),
  tmpMsg: require("./bot/utils/tmpMsg"),
};

client.on("ready", async () => {
  console.log("Robo-bot ready");

  client.user.setPresence({
    activities: [{ name: "Robolab", type: ActivityType.Watching }],
    status: "online",
  });
  await initCache(client);
});

const idKey = require("./bot/utils/idKey");
var currentGames = {};

var state = { client, idKey, env, isDev, currentGames, ...methods };

const messageXP = require("./bot/passive/messageXP");
const handleRoboEvent = require("./bot/passive/handleRoboEvent");
const matchCmd = /^>([a-zA-Z]+)/;
// const { getCache } = require('./bot/utils/getCache')

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;

  state = {
    /* Init Obj */
    ...state,
    /* overwrite */
    mentions: msg.mentions,
    channelID: msg.channel.id,
  };

  let match = msg.content.match(matchCmd)
  if (match && msg.channel.id === "462274708499595266") {
    let [_, cmdName] = match
    cmdName = cmdName.toLowerCase()

    let fn = prefixCMDs?.[cmdKey]
    if (!fn) return // given cmd not found

    fn(msg, state)
  }

  await messageXP(msg, state);

  if (client.robo_events[msg.channel.id]) {
    handleRoboEvent(client, msg);
  }
});

const welcome = require("./bot/passive/welcome");
client.on("guildMemberAdd", async (member) => {
  welcome(member);
});

let prefixCMDs = {}

let parseInputs = ()=>{}
let validateInputs = ()=>{}
let preprocessInputs = ()=>{}
let SynthInter = ()=>{
  // https://discord.com/developers/docs/interactions/receiving-and-responding
  // https://discord.com/developers/docs/resources/channel#message-object
  // https://discordjs.guide/keyv/#command-handler
}

let patchInputGetters = (msg, inputs) => {
  msg.options = msg?.options ?? {}

  msg.options.get = key => ({value: inputs[key]})

  let otherGets = key => inputs[key]
  msg.options.getUser = otherGets
  msg.options.getMember = otherGets
  msg.options.getRole = otherGets
  msg.options.getChannel = otherGets
  msg.options.getMentionable = otherGets
  msg.options.getAttachment = otherGets
  msg.options.getString = otherGets
  msg.options.getInteger = otherGets
  msg.options.getBoolean = otherGets
  msg.options.getNumber = otherGets
}

let compatWrap = async (cmd, msg) => {
  // author/user patch
  msg.user = msg.author

  // Reply patch
  let reply = null
  msg.deferReply = (content)=>reply={}
  msg.editReply = (content)=>reply=content

  // Parse Inputs
  let inputs = parseInputs(msg) // {key: value}
  let [isValid, err] = validateInputs(command.interface, inputs)
  if (!isValid) reply = err

  // Execute (if valid args)
  if (isValid) {
    inputs = preprocessInputs(inputs)
    patchInputGetters(msg, inputs)
  
    await cmd.execute(msg)
  }
  
  // Response
  if (reply) msg.reply(reply)
}

/** *   COMMANDS   ***/
client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./bot/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./bot/commands/${file}`)
  client.commands.set(command.data.name, command)

  if (command.interface) {
    prefixCMDs[command.data.name] = (msg, otherData)=> {
      

      compatWrap(command, msg)
      // idk how to validate whether the caller has sufficient perms 
      // given the slash command settings in discord server settings 
    }
  }

  for (let a of command?.alias ?? []) {
    client.commands.set(a, command)
    prefixCMDs[a] = prefixCMDs[command.data.name]
  }
}

/** *   SLASH INTERACTIONS   ***/
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  if (interaction.commandName === "tumblebounce") {
    return;
  }

  try {
    await command.execute(interaction);
    client.channels.cache
      .get("945055759824207962")
      .send(
        `# Interaction executed\n**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\``
      );
  } catch (error) {
    console.error(
      "*********************************************************************************************************************"
    );
    console.error(error);
    console.error(
      "*********************************************************************************************************************"
    );
    client.channels.cache
      .get("945055759824207962")
      .send(
        `# Error while executing interaction\n**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\`\n\n`
      );
    await interaction.editReply({
      content:
        "Something broked when we ran this command! This has been logged. Please try again later.",
      ephemeral: true,
    });
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isButton()) return;
  // console.log(interaction);

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
});

// i'll move as a util later

function onlyAlphanumeric(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "");
}

async function isLinked(username) {
  let linked;
  let cleanedUsername = encodeURIComponent(onlyAlphanumeric(username));

  try {
    const { data } = await devAPI.getUser(cleanedUsername);
    if (!data) return (linked = false);

    return (linked = data ? "discordLink_1" in data : false);
  } catch {
    return (linked = false);
  }
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  // console.log(interaction)

  const mechakeysUsernameInputValue = interaction.fields.getTextInputValue(
    "mechakeysUsernameInput"
  );
  const cleanedValue = onlyAlphanumeric(mechakeysUsernameInputValue);

  const userID = interaction.user.id;
  const discordUsername = encodeURIComponent(interaction.user.username);

  console.log(
    `[linking] ${userID} (discord username ${discordUsername}) linked to mechakeys user ${cleanedValue}`
  );

  const guild = interaction.client.guilds.cache.get("462274708499595264");
  const apiLogChannel = guild.channels.cache.get("771724978264604682");

  const embed = new EmbedBuilder()
    .setTitle("User attempted to link account")
    .setColor("#2bffb8")
    .setDescription(
      `<@${userID}> (${userID}) attempted to link to MechaKeys user ${cleanedValue}`
    );
  apiLogChannel.send({ embeds: [embed] });

  const link = `${static.endpoints.developer}/?action=linkUserDiscord&discordID=${userID}&discordUsername=${discordUsername}&mechakeysUsername=${cleanedValue}`;
  const res = await axios.get(link);

  let notFound = new EmbedBuilder()
    .setColor("ff0000")
    .setDescription(
      `**${cleanedValue}** either does not exist, or you are already linked to an account. Check your spelling and __CaPiTaLiZe everything correctly__.`
    );

  let notFoundToLog = new EmbedBuilder()
    .setColor("ff0000")
    .setDescription(
      `<@${userID}> tried to link to **${cleanedValue}**, but they are already linked, or the account does not exist.`
    );

  const notFoundToLogRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Check MechaKeys Username via devAPI")
      .setURL(
        `${static.endpoints.developer}/?action=getUser&username=${cleanedValue}`
      )
      .setStyle(ButtonStyle.Link)
  );

  let success = new EmbedBuilder()
    .setColor("2f3136")
    .setDescription(
      `# Last step: check your email! \n<@${userID}>, **check your email and click the link inside** to finish linking your MechaKeys account.`
    );

  let userAlreadyLinkedCheck = await isLinked(cleanedValue);

  let alreadyLinked = new EmbedBuilder()
    .setColor("ff0000")
    .setDescription(
      `**${cleanedValue}** is already linked to a Discord account. You cannot link to another account, and you cannot unlink accounts.`
    );

  let alreadyLinkedToLog = new EmbedBuilder()
    .setColor("ff0000")
    .setDescription(
      `<@${userID}> tried to link to **${cleanedValue}**, which is already linked to a Discord account.`
    );

  if (userAlreadyLinkedCheck === true) {
    apiLogChannel.send({ embeds: [alreadyLinkedToLog] });

    return interaction.reply({ embeds: [alreadyLinked], ephemeral: true });
  }

  if (!res || !res.data || !res.data.success) {
    console.log("[linking]");
    console.log({ mechakeysUsernameInputValue });
    console.log(
      `[linking] ${mechakeysUsernameInputValue} was attempted to be linked to, but does not exist, or Discord user is already linked.`
    );
    apiLogChannel.send({
      embeds: [notFoundToLog],
      components: [notFoundToLogRow],
    });
    return interaction.reply({ embeds: [notFound], ephemeral: true });
  }

  interaction.reply({ embeds: [success], ephemeral: true });
});

// client.on('interactionCreate', async interaction => {
// 	if (!interaction.isUserContextMenuCommand()) return;
// 	// console.log(interaction);
// });

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return

  const store_prices = {
    pokeball: 10,
    bodyguards: 25,
    "glowing pencil": 15,
    "fist of doom": 200,
    bitchslap: 10,
    "flying fist": 50,
    "boost device": 25,
    "gold relic": 20,

    duckbill: 100,
    swaggymoment: 100,
    spinklepurpo: 100,
    thunkapurpo: 100,
    spicymeme: 200,
    binkoblue: 100,
    fortnitebad: 100,
    nibbleblue: 100,
    novelkeycream: 100,
    vaporwave: 200,
    axiosgreen: 100,
    deathknight: 5000,
    greenbois: 200,
    electrobois: 200,
    alwaysred: 500,
    aesthetic: 200,
    finnapepe: 200,
    tumbleyellow: 100,
    statisticallyblue: 500,
  };

  if (interaction.customId === "itemSelect") {
    try {
      let userWantsToBuyItem = interaction.values[0];

      let successfulPurchaseEmbedTitle;
      let successfulPurchaseEmbedDescription;

      if (userWantsToBuyItem === "item_pokeball") {
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["pokeball"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          let add_ball = await discordAPI.incrementField(interaction.user.id, {
            field: "pokeballCount",
          });

          if (!add_ball.success) {
            return interaction.reply(
              `<@${interaction.user.id}>, something went wrong when buying a pokeball!`
            );
          }

          // SETUP EMBED
          successfulPurchaseEmbedTitle = "You bought a Pokeball!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought a Pokeball for \`${store_prices["pokeball"]} keycaps\`! You now have \`${add_ball.data.Attributes.pokeballCount} pokeballs\`.`;
          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["pokeball"]} keycaps\`! Yikes...`
          );
        }
      }

      if (userWantsToBuyItem === "item_glowingpencil") {
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["glowing pencil"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          let add_glowingpencil = await discordAPI.incrementField(
            interaction.user.id,
            { field: "glowingPencilCount" }
          );

          if (!add_glowingpencil.success) {
            return interaction.reply(
              `<@${interaction.user.id}>, something went wrong when buying a glowing pencil!`
            );
          }

          // SETUP EMBED
          successfulPurchaseEmbedTitle = "You bought a Glowing Pencil!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought a Glowing Pencil for \`${store_prices["glowing pencil"]} keycaps\`! You now have \`${add_glowingpencil.data.Attributes.glowingPencilCount} glowing pencils\`.`;
          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["glowing pencil"]} keycaps\`! Yikes...`
          );
        }
      }

      if (userWantsToBuyItem === "item_boostdevice") {
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["boost device"]}` }
        );
        console.log(deductKeycapRes)
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          let add_boostDevice = await discordAPI.incrementField(
            interaction.user.id,
            { field: "boostDeviceCount" }
          );
          
          if (!add_boostDevice.success) {
            return interaction.reply(
              `<@${interaction.user.id}>, something went wrong when buying a boost device!`
            );
          }

          // SETUP EMBED
          successfulPurchaseEmbedTitle = "You bought a Boost Device!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought a Boost Device for \`${store_prices["boost device"]} keycaps\`! You now have \`${add_boostDevice.data.Attributes.boostDeviceCount} boost devices \`.`;
          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["boost device"]} keycaps\`! Yikes...`
          );
        }
      }

      if (userWantsToBuyItem === "item_goldrelic") {
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["gold relic"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          let add_goldRelic = await discordAPI.incrementField(
            interaction.user.id,
            { field: "goldRelicCount" }
          );

          if (!add_goldRelic.success) {
            return interaction.reply(
              `<@${interaction.user.id}>, something went wrong when buying a gold relic!`
            );
          }

          // SETUP EMBED
          successfulPurchaseEmbedTitle = "You bought a Gold Relice!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought a Gold Relic for \`${store_prices["gold relic"]} keycaps\`! You now have \`${add_goldRelic.data.Attributes.goldRelicCount} gold relics\`.`;
          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["gold relic"]} keycaps\`! Yikes...`
          );
        }
      }

      if (userWantsToBuyItem === "item_bodyguards") {
        if (interaction.member.roles.cache.get("811255216128786503")) {
          return interaction.reply(
            `<a:red_siren:812813923522183208> <@${interaction.user.id}> You already have bodyguards! Dumbass. Now fuck off`
          );
        }
        // buy role
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["bodyguards"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          interaction.member.roles.add("811255216128786503");

          successfulPurchaseEmbedTitle = "You bought Bodyguards!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought Bodyguards for \`${store_prices["bodyguards"]} keycaps\`! Remember, if you /fight, you lose them and will have to re-buy!`;

          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["bodyguards"]} keycaps\`! Now scram!`
          );
        }
      }

      if (userWantsToBuyItem === "item_fistofdoom") {
        if (interaction.member.roles.cache.get("865711992785731614")) {
          return interaction.reply(
            `<a:red_siren:812813923522183208> <@${interaction.user.id}> You have a Fist of Doom already! Now go superfight someone, dumbass.`
          );
        }
        // buy role
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["fist of doom"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          interaction.member.roles.add("865711992785731614");

          successfulPurchaseEmbedTitle = "You bought the Fist of Doom!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought the Fist of Doom for \`${store_prices["fist of doom"]} keycaps\`! Now go superfight someone!`;

          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["fist of doom"]} keycaps\`! Now scram!`
          );
        }
      }

      if (userWantsToBuyItem === "item_flyingfist") {
        if (interaction.member.roles.cache.get("939774831220633600")) {
          return interaction.reply(
            `<a:red_siren:812813923522183208> <@${interaction.user.id}> You already have a Flying Fist! Dumbass. Save a tumbleweed or something`
          );
        }
        // buy role
        const deductKeycapRes = await devAPI.deductKeycaps(
          interaction.user.id,
          { amount: `${store_prices["flying fist"]}` }
        );
        if (
          deductKeycapRes &&
          deductKeycapRes.success
        ) {
          interaction.member.roles.add("939774831220633600");

          successfulPurchaseEmbedTitle = "You bought the Flying Fist!";
          successfulPurchaseEmbedDescription = `<@${interaction.user.id}> You bought the Flying Fist for \`${store_prices["flying fist"]} keycaps\`! Go save those tumbleweeds!`;

          let successfulPurchaseEmbed = new EmbedBuilder()
            .setTitle(`${successfulPurchaseEmbedTitle}`)
            .setDescription(`${successfulPurchaseEmbedDescription}`)
            .setColor("2f3136");

          return interaction.reply({ embeds: [successfulPurchaseEmbed] });
        } else {
          return interaction.reply(
            `<a:red_siren:812813923522183208> You don't have \`${store_prices["flying fist"]} keycaps\`! Now scram!`
          );
        }
      }
      client.channels.cache
        .get("945055759824207962")
        .send(
          `**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\``
        );
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content:
          "There was an error while executing this command. Please try again later.",
        ephemeral: true,
      });
    }
  }
});

console.log('ProdCheck', TOKEN)
client.login(TOKEN);
