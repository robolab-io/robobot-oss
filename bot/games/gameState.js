const { discordAPI, isDev } = require("robo-bot-utils");
const env = isDev ? 'staging' : 'production'


const gameState = {}
/* Example:
 { '751665008869376010': {
      tumblebounce: {
        bouncers: [],
        bouncer_ids: [],
        bouncer_scores: [],
        startTime: 1614970694828,
        need_remote_start: true,
        return_time: 1614986110121,
        bounce_uuid: '1614982347342',
        needTouch: false
      }
    } 
  }
*/

// populate from db on startup 
let initGameState = async (guildID = '462274708499595264') => {
  const guildStatesRes = await discordAPI.getGuildState(guildID)
  if (!guildStatesRes.success) return console.log('NOTE: Failed to get server state')

  const guildStates = guildStatesRes?.data || {}

  Object.keys(guildStates).map(x => {
    if (x === 'discordID') { return false }

    const [ _, gameEnv, channelID, gameTitle] = x.split('_') // args
    const gameObject = guildStates[x]

    if (gameEnv !== env || (!gameEnv || !channelID || !gameTitle) ) { 
      return console.log('Failed to init game state on key:', x)
    }
    
    gameObject.need_remote_start = true

    gameState[channelID] = gameState?.[channelID] || {}
    gameState[channelID][gameTitle] = gameState?.[channelID]?.[gameTitle] || gameObject
  })

  console.log('Initialized server game state:\n', gameState)
}


module.exports = {
  useGames: ()=>gameState,
  initGameState
}