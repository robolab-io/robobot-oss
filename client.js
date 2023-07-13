/***   INIT CLIENT   ***/
const { Client, GatewayIntentBits, Partials } = require("discord.js");
let client = new Client({
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



/***   CLIENT READY   ***/
const { ActivityType } = require("discord.js");
const { initCache } = require("./bot/utils/getCache");
client.on("ready", async () => {
  console.log("Robo-bot ready");

  client.user.setPresence({
    activities: [{ name: "Mechakeys", type: ActivityType.Watching }],
    status: "online",
  });
  await initCache(client);
})



/***   CLIENT COMMANDS   ***/
const { Collection } = require("discord.js");
const fs = require("fs");

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./bot/commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./bot/commands/${file}`)
  client.commands.set(command.data.name, command)
  for (let a of command?.alias ?? []) {
    client.commands.set(a, command)
  }
}


/***   CLIENT INTERACTIONS   ***/
const { interactionHandler } = require('./bot/interactions') 
interactionHandler(client)



/*** SERVER ***/
let server = require('./bot/server')
server(client)

module.exports = {
  client
}