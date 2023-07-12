const keycapAPI = require("../utils/keycapAPI");

async function awardAll(guild, winners, reward, reason, getUserId=false) {
	return Promise.all(winners.map(
    (user, i) => keycapAPI.awardKeycaps(
      guild,
      typeof getUserId === 'function' ? getUserId(user, i) : user,
      typeof reward === 'function' ? reward(user, i) : reward,
      reason || 'gift'
    )
  ))
}

let pepeGifs = [
  'clappingPepe.gif',
  'dancingPepe.gif',
  'pepe3dworld.gif',
  'pepeJam.gif',
  'pepeNod.gif',
  'pepePat.gif',
  'pepePopcorn.gif',
  'pepewave.gif',
  'rainbowPepe.gif',
  'rainbowPepe2.gif'
]

let flavor = {
  tumblestreak: require('../static/tumbleStreakFlavor'),
  secretpepe: require('../static/secretPepeFlavor'),
  tumbleBounce: require('../static/tumbleBounceFlavor')
}

function interpretRange(obj, val) {        
  return Number(Object.keys(obj).sort((a, b)=> b-a).find((x)=> val >= x))
}

function getFlavor(category, spec, score) {
  const flavorKey = interpretRange(flavor[category][spec], score)
  const arr = flavor[category][spec][flavorKey]
  const random = arr[Math.floor(Math.random() * arr.length)];
  return random
}

function getRandom(category, spec) {    
  const arr = flavor[category][spec]
  const random = arr[Math.floor(Math.random() * arr.length)];
  return random
}


module.exports = {
  awardAll,
  getFlavor,
  getRandom,
  pepeGifs
}