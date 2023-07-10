let moduleExport;

try {

  moduleExport = require('private-utils')
  console.info(`Successfully imported private-utils`)

} catch (err) {
  console.warn(`Fail to import private-utils:\n${err.message}`)

  // Mock Module Export
  moduleExport = {
    devAPI: {
      // would be nice to add some mock responses, but i don't have time
      getXP: async (user_id)=>{},
      giveXP: async (user_id, { amount = 0 })=>{},
      getUser: async (MK_username)=>{},
      getRank: async (MK_username)=>{},
      getUserByDiscordID: async (discord_id)=>{},
      deductKeycaps: async (user_id, { amount = 0 })=>{},
      giveKeycaps: async (user_id, { amount=0, reason='mock' })=>{},
      tip: async (DC_username, MK_username)=>{},
      getLeaders: async (/*none*/)=>{}
    },
    discordAPI: {
      getUser: async (user_id)=>{},
      getPokemon: async (user_id)=>{},
      getJackpot: async (user_id)=>{}, // why does this require uid?
      incrementField: async (user_id, { field= "mockField" })=>{},
      decrementField: async (user_id, { field= "mockField" })=>{},
      claimDaily: async (user_id)=>{},
      setGuildField: async (guildID, { guildField='gameObjUID', guildObject={/* channel game-obj instance */} })=>{},
      getCmdInfo: async (user_id, cmdName)=>{},
      setCmdInfo: async (user_id, { type_amount=0, type='cmdName' })=>{},
      addToJackpot: async (amount)=>{}
    },
    internal: {
      // Should message be analyzed further by bot
      filterMessage: async (msg)=>Boolean(false),
      xpToGive: async (multiplier)=>Number(50)
    },
    static: {
      endpoints:{
        callback:"http://localhost:8008/callback",
        event:"http://localhost:8008/event",
        discord:"http://localhost:8008/discord",
        developer:"http://localhost:8008/developer"
      },
      flavors: {
        pray: {
          instant_flavors: [ "You feel the ground tremble..." ],
          delayed_flavors: [ "You feel magical and stuff, for sure..." ],
          nothing_flavors: [ "You finish praying, and ... nothing happened." ]
        }
      },
      mappings: {
        pray_mappings: [
          {event:"instant", chance:100},
        ],
        pray_chances: {
          instant: [
            {event:"keycap_drop", chance:100}
          ],
          delayed: [
            {event:"keycap_drop", chance:100}
          ]
        }
      }
    },
    isDev: process.argv.includes('dev'),
    TOKEN: null
  }
}

module.exports = moduleExport