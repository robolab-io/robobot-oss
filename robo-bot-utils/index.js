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
      getXP: async ()=>{},
      giveXP: async ()=>{},
      getUser: async ()=>{},
      getRank: async ()=>{},
      getUserByDiscordID: async ()=>{},
      deductKeycaps: async ()=>{},
      giveKeycaps: async ()=>{},
      tip: async ()=>{},
      getLeaders: async ()=>{}
    },
    discordAPI: {
      getUser: async ()=>{},
      getPokemon: async ()=>{},
      getJackpot: async ()=>{},
      incrementField: async ()=>{},
      decrementField: async ()=>{},
      claimDaily: async ()=>{},
      setGuildField: async ()=>{},
      getCmdInfo: async ()=>{},
      setCmdInfo: async ()=>{},
      addToJackpot: async ()=>{}
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