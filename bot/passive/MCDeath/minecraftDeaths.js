const { getEntities, getFlavor, getMedia } = require("./helpers").mcDeathHelp
const { flavorFuncs } = require('./deathFlavor');

module.exports = {
  kill: async (obj, type='msg', media='img') => {
    var { media, ...constObj } = await getEntities(obj, type, media)
  
    const flavor = getFlavor(flavorFuncs, constObj)

    const joined = constObj.getUser.joinedAt
    const score = `${Math.sqrt( (Date.now()-joined) / 1000 )|0}`

    const content = await getMedia(media, constObj, flavor, score)
    const channel = type==='msg'?obj.channel : obj.guild.systemChannel
    channel.send(content)
  }
}
