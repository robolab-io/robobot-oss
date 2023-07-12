/***   Client   ***/
let { client } = require('./client') 
const { TOKEN } = require("robo-bot-utils")


/**  Prefix Commands  **/
const matchCmd = /^>([a-zA-Z]+)/
let dailyCMD = require('./bot/commands/daily')
let prayCMD = require('./bot/commands/pray')
let compatWrap = async (cmd, msg) => {
  // author/user patch
  msg.user = msg.author

  // Reply patch
  let reply = null
  msg.deferReply = (content)=>reply={}
  msg.editReply = (content)=>reply=content

  // Execute
  await cmd.execute(msg)
  if (reply) msg.reply(reply)
}


/**  Per-Message Effects  **/
const messageXP = require("./bot/passive/messageXP")
const handleRoboEvent = require("./bot/passive/handleRoboEvent")
const gameHandler = require('./bot/games/gameHandler')
const { ch_bots, ch_general, dev_bot } = require('./bot/ids')
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return

  /**  Prefix Commands  **/
  let match = msg.content.toLowerCase().match(matchCmd)
  if (match && [ch_general, ch_bots, dev_bot].includes(msg.channel.id) ) {
    let [_, cmdName] = match
    if ( ['daily', 'd'].includes(cmdName) ) {
      compatWrap(dailyCMD, msg)
    } else
    if ( ['pray', 'p'].includes(cmdName) ) {
      compatWrap(prayCMD, msg)
    }
  }

  /**  Passives  **/
  await messageXP(msg)
  await gameHandler(msg)

  if (client.robo_events[msg.channel.id]) {
    handleRoboEvent(client, msg)
  }
});


/**  Per-Join Effects  **/
const welcome = require("./bot/passive/welcome")
client.on("guildMemberAdd", async (member) => {
  welcome(member) // adds linked role if return member
});


client.login(TOKEN)
