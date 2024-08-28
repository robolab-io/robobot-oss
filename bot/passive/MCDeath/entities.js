/***   Constants   ***/
mobKey = ['shoots', 'fights', 'stings','magical', 'fiery', 'heavy', 'thicc', 'explosive']
itemKey = ['pointy', 'projectile', 'fluid', 'explosive', 'tall', 'climbable','heavy', 'falls', 'magical', 'weapon']

module.exports.mobKey = mobKey
module.exports.itemKey = itemKey

// all === mobKey/itemKey respectively
// default ===  true / []
// none === false ?

module.exports.mobs = {
  //misc
  krappa: mobKey,
  flushedChick: ['fights'],
  rooSellout: true,
  creeper: [ 'explosive', 'fights', 'fiery' ],
  greenman: ['magical', 'heavy', 'thicc'],

  //mecha
  megusta: true,
  robolab: true,

  //tumble
  tumbleweed: ['stings', 'thicc'],
  tumbleDio: ['stings', 'thicc'],

  //pepes
  ...([
    'pepepoggies', 'pepeHands', 'pepefeelsGoodMan', 'oldPepe', 'pepemonkahmm', 
    'pepeMonkaS', 'clownPepe', 'clownPepeW', 'clownworldRage', 'peepoPointLaugh', 
    'pepeOhGodMan', 'peepoEZ', 'peepoSadMan', 'peepoGGERS', 'peepoHideS', 'peepoSS', 
    'peepoHeart', 'pepefeelsAmazingMan', 'pepenog', 'pepoGiggle', 'peepoHappy', 'peepoFloorCry', 
    'blessedPepe', 'NOOOOOG', 'pepefeelsWeirdMan', 'struggledev', 'coolPepe', 'pepeOK', 'pepekek'
  ].reduce((agg, k)=> { return {[k]: ['fights'], ...agg} }, {})),
  
  //yellows
  flushpeek: ['shoots', 'fights', 'stings','magical', 'fiery', 'heavy', 'thicc'],
  coolguy: ['shoots', 'fights', 'stings','magical', 'fiery', 'heavy', 'thicc'],
  pensiveCube: ['shoots', 'fights', 'stings','magical', 'fiery', 'heavy', 'thicc'],
  mechakeysCheaters: ['shoots', 'fights', 'stings','magical', 'fiery', 'heavy', 'thicc'],
}


module.exports.items =  {
  //misc.
  ditto: ['fluid', 'weapon'],
  Eyes: true,
  zoomeyes: true,
  this: itemKey,
  checkmarkcross: ['pointy', 'tall', 'climbable','heavy', 'falls', 'weapon'],
  checkmarktick: ['pointy', 'tall', 'climbable','heavy', 'falls', 'weapon'],
  pogshake: ['pointy', 'fluid', 'explosive', 'magical', 'weapon'],
  pogSLIDE: ['pointy', 'fluid', 'explosive', 'magical', 'weapon'],
  morning: ['magical', 'weapon'],
  night: ['magical', 'weapon'],
  HelpHalu: ['explosive'],
  what: true,
  yess: true,
  weirdchamp: ['explosive','heavy','falls'],
  crewmateDance: ['pointy', 'magical', 'weapon'],
  hamsterthing: ['heavy', 'falls', 'weapon'],
  topKek: true,
  topKek2: true,
  GitGud: ['fluid', 'explosive', 'tall', 'climbable','heavy', 'falls', 'magical', 'weapon'],
  welcomeMat: ['explosive', 'weapon'],
  choccyMilk: ['fluid'],
  deletThis: ['projectile', 'explosive'],
  squint: ['projectile', 'explosive', 'magical', 'weapon'],
  mildStress: ['projectile', 'explosive', 'magical', 'weapon'],
  huggies: ['heavy', 'falls', 'magical', 'weapon'],
  
  //pepe
  peepeeWave: true,
  smoke: ['magical', 'weapon'],

  //yellow
  ...([
    'PAINPAINPAIN', 'pain', 'ooooooooooohhh', 'aaaaaaaaaaaaahhh',
    'Uhm', 'tipsFedora', 'imOkay', 'superflushed'
  ].reduce((agg, k)=> { return {[k]: true, ...agg} }, {})),
  
  //tumbles
  tumbleSleep: ['pointy', 'projectile', 'fluid'],
  tumbleFeelsMan: ['pointy', 'projectile', 'fluid'],

  //platforms and frameworks
  Twitch: ['pointy', 'projectile'],
  YouTube: ['projectile', 'fluid', 'explosive', 'magical', 'weapon'],
  firebase: ['heavy', 'magical', 'weapon'],
  vue: true,
  
  //thinking
  thonk: true,
  thonkangry: true,
  thonkang: true,
  thunk: true,
  thonker: true,
  angryThonker: true,
  bigHmm: true,
  '200IQ': true,
  thinkingc: true,
  feelsVeryVerySpecialMan: true,
  shortCircuit: true,
  
  //mecha-etc.
  switchRobo: ['projectile', 'weapon'],
  roboascend: ['projectile', 'weapon'],
  switchCherryBlue: ['projectile', 'weapon'],
  switchPop: ['projectile', 'weapon'],
  switchDeku: ['projectile', 'weapon'],
  switchCombat: ['projectile', 'weapon'],
  mouseCorsair: ['projectile', 'weapon'],
  mouseDiggly: ['projectile', 'weapon'],
  mouseMac: ['projectile', 'weapon'],

  //mecha-symbols
  RoboHelp: ['explosive'],
  Sync: ['magical', 'weapon'],
  info: ['fluid', 'explosive', 'magical', 'weapon'],
  warning:  ['fluid', 'explosive', 'magical', 'weapon'],
  success:  ['fluid', 'explosive', 'magical', 'weapon'],
  error:  ['fluid', 'explosive', 'magical', 'weapon'],
  place4: true,
  place3: true,
  place2: true,
  place1: true,
  keycapsOverflowingBag: ['fluid', 'heavy'],
  keycapsTreasureChest: true,
  keycapsBag: ['fluid', 'heavy'],
  keycapsPile: ['fluid', 'heavy', 'falls'],
  keycap: ['projectile', 'weapon'],
}
