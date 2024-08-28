//mob = user.lastMessage.mentions.first()
//else assign random
const { mcDeathImg } = require('./img');
const { RichEmbed } = require('discord.js');
const { mobs, items, mobKey, itemKey } = require('./entities');

function randEl(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getMention(obj, type) {
  switch(type) {
    case 'msg': 
      return obj.mentions.users.first()
    case 'member': 
      return obj.lastMessage.mentions.users.first()
  }
}

function validArrs(arr1, arr2) {
  if ( !(arr1 && arr2) ) {
    return false
  }
  if (arr1.constructor!==Array || arr2.constructor!==Array) {
    return false
  }
  if (arr1.length===0 || arr2.length===0) {
    return false
  }
  return true
}

module.exports = {
  flavorHelp: {
    validArrs,
    
    arrCond(bool, arr){
      if (bool) {
        return arr
      }
      return []
    },

    isArr(arr){
      return arr.constructor === Array
    },
    
    crosscheckAnd (arr1, arr2) {
      //every item in arr1 exists in arr2
      if(!validArrs(arr1, arr2)){return false}
      return arr1.every(r => arr2.includes(r))
    },
    
    crosscheckSome (arr1, arr2) {
      //some items in arr1 exists in arr2
      if(!validArrs(arr1, arr2)){return false}
      return arr1.some(r => arr2.includes(r))
    },
    
    crosscheckOne (arr1, arr2) {
      //only one item in arr1 exists in arr2
      if(!validArrs(arr1, arr2)){return false}
      return arr1.map(r => arr2.includes(r)).reduce((sum, next) => sum + next, true) === 1
    } 
  },
  mcDeathHelp: {
    async getEntities(obj, type, media) {
      var getUser = obj
      if(type ==='msg'){
        const mention = getMention(obj, type)
        getUser = obj.guild.members.get(mention? mention.id : obj.author.id)
      }
      
      const guild = await obj.guild.fetchMembers()
      const emote = randEl(obj.guild.emojis.map(e => ({name: e.name, id: e.id, a: e.animated}) ))

      var user, mobName, itemName;
      user = getUser.displayName
      itemName = emote.name

    /*** User Mob ***/
      mob = randEl(guild.members.map(m=>m.id))
      mobName = guild.members.get(mob).displayName

    /*** Emoji Mob ***/
      //mobName = randEl(obj.guild.emojis.map(e => ({name: e.name, id: e.id, a: e.animated}) )).name
      
    /*** attributes ***/
      // defined attributed 
      //const mobArr = Object.keys(mobs).includes(mobName)? mobs[mobName] : true 
      const itemArr = Object.keys(items).includes(itemName) ? items[itemName] : true

      // random attributes
      //const itemArr = itemKey //randEl(itemKey)
      const mobArr = mobKey //randEl(mobKey)

      // default attributes
      //const [mobArr, itemArr] = [true, true]

      //if non displayable character use embed, tho i could use default font too
      const goodChars = (getUser.displayName+mobName+itemName).match(/^[a-z0-9!"#@%&'()~+\-*=.,{}?$<>:€®©\s]+$/i)
      if (media==='img') {
        media = goodChars ? 'img' : 'embed'
      }
      
      if(media==='embed') {
          user = `<@${getUser.id}>`
          mobName = `<@${mob}>`
          itemName = `<${emote.a?'a':''}:${emote.name}:${emote.id}>`
      }
    
      return { media, getUser, user, mobName, itemName, mobArr, itemArr }
    },
    
    getFlavor(flavorFuncObj, {getUser, user, mobName, itemName, mobArr, itemArr}) {
      var flavorArr = []
      Object.entries(flavorFuncObj).forEach(([funcname, func]) => {
        flavorArr = flavorArr.concat(func(
          { user, mob: {mobName , mobArr}, item:{itemName, itemArr} }
        ))
      })
      flavorArr = flavorArr.filter(Boolean)
      console.log(flavorArr)
      return randEl(flavorArr)
    },
    
    async getMedia(media, constObj, flavor, score) {
      var content;
      switch(media) {
        case 'embed': 
          return new RichEmbed({
            description: flavor,
            fields: [
              {
                name: 'SCORE:',
                value: score
              }
            ]
          })
    
        case 'img': 
          return {
            files: [{ //['../static/output.png']}
              attachment: await mcDeathImg(constObj.getUser.displayName, flavor, score),
              name: 'mcDeath.png'
            }]
          }
      }
      
    }
  }
}
