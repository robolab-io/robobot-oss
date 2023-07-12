const { useGames } = require('../games/gameState')

let gameMap = {
  tumblestreak: require('./tumbleHandler'),
  secretpepe:   require('./pepeHandler'),
  tumblebounce: require('./bounceHandler'),
  bombsquad:    require('./bombHandler')
}

/***   MAIN   ***/
module.exports = async (msg) => { 
  let channelGames = useGames()[msg.channelId]

  // Handle Game Instances
  for(let [game_type, handler] of Object.entries(gameMap)) {
    if (channelGames?.[game_type]) await handler(msg) 
  }
}