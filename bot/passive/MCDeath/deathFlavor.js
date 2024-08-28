const {validArrs, arrCond, isArr, crosscheckAnd, crosscheckSome, crosscheckOne} = require('./helpers').flavorHelp

/***   Server Deaths   ***/
module.exports.onBan = ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
  //https://discord.js.org/#/docs/main/stable/class/Guild?scrollTo=fetchBan  could cross reference. idk if i counts as leaving
  //https://discord.js.org/#/docs/main/stable/class/Client?scrollTo=e-guildBanAdd could use diff event listener
  guild.fetchBan(user)===true
  var auth =[
    'Administrative',
    'Moderator',
    'Server'
  ]
  responses = [
    `${user} was killed by [Intentional ${auth} Design]`,
    
    ...arrCond(mobArr, [
      `${user} didn't want to live in the same world as ${mobName}`,
      `${user} withered away whilst fighting ${mobName}`,
      `${user} died because of ${mobName}`,
      //fire
      `${user} walked into fire whilst fighting ${mobName}`,
      `${user} was burnt to a crisp whilst fighting ${mobName}`,
      //lava
      `${user} tried to swim in lava to escape ${mobName}`,
      `${user} walked into danger zone due to ${mobName}`
    ]),

    //generic
    `${user} fell out of the world`,
    `${user} died`,
    `${user} withered away`,

    //fire
    `${user} went up in flames`,
    `${user} burned to death`,

    //lava
    `${user} tried to swim in lava`,
    `${user} discovered the floor was lava`
  ]
}

module.exports.onLeaveEarly = ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
  //leave early
  Date.now()-user.joinedAt<threshold
  response = [
    `${user} was too soft for this world`,
    `${user} experienced kinetic energy`,

    ...arrCond(mobArr , [
      `${user} was too soft for this world (${mobName} didn't help)`,
      `${user} experienced kinetic energy whilst trying to escape ${mobName}`
    ])
  ]
}

/***   Death Categories   ***/
module.exports.flavorFuncs = {
  projectile: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    console.log(mobName, mobArr, itemName, itemArr)
    return [
      ...arrCond( (isArr(itemArr) && itemArr.includes('projectile')) , [
        `${user} was pummeled by ${itemName}`
      ]),
      ...arrCond(isArr(mobArr) && mobArr.includes('shoots') , [
        `${user} was shot by ${mobName}`
      ]),
  
      ...arrCond( (isArr(itemArr) && isArr(mobArr)) && (itemArr.includes('projectile') && mobArr.includes('shoots')) , [
        `${user} was shot by ${mobName} using ${itemName}`
      ]),
  
      ...arrCond(crosscheckOne(['shoots', 'fights'], mobArr), [
        `${user} was pummeled by ${mobName}`
      ])    
    ]
  },
  pointy: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Defaults
      /* `${user} was pricked to death`,
      `${user} was stung to death`, */
  
      //Stab/Sting
      ...arrCond(isArr(mobArr) && mobArr.includes('stings') , [
        `${user} was stung to death by ${mobName}`,
      ]),
      ...arrCond(crosscheckSome (['stabs', 'stings'], mobArr) , [
        `${user} was impaled by ${mobName}`,
      ]),
  
      //Pointy
      ...arrCond(isArr(itemArr) && itemArr.includes('pointy') , [
        `${user} was pricked to death ${itemName}`,
        `${user} was poked to death by a ${itemName}`,
      ]),
    
      ...arrCond((isArr(itemArr) && itemArr.includes('pointy')) && mobArr , [
        `${user} was impaled by ${mobName} with ${itemName}`,
        `${user} walked into a ${itemName} whilst trying to escape ${mobName}`,
        `${user} was poked to death by a ${itemName} whilst trying to escape ${mobName}`
      ])
    ]
  },
  fluids: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Defaults
      /* `${user} drowned`, */
  
      //Specifics
      ...arrCond(isArr(itemArr) && itemArr.includes('fluid') , [
        `${user} drowned in ${itemName}`,
        `${user} tried to swim in ${itemName}`,
        ...arrCond(mobArr , [
          `${user} tried to swim in ${itemName} to escape ${mobName}`,
        ])
      ]),
  
      ...arrCond( (isArr(itemArr) && mobArr) && itemArr.includes('swims') , [
        `${user} drowned whilst trying to escape ${mobName}`,
      ])
  
    ]
  },
  generic: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    //players/mobs
    if ((!isArr(mobArr) && !isArr(mobArr))) {
      return [
        ...arrCond(mobArr, [
          `${user} was slain by ${mobName}`,
          `${user} was killed trying to hurt ${mobName}`,
        ]),
        ...arrCond( (mobArr && itemArr) , [
          `${user} was killed by ${mobName} using ${itemName}`,
          `${user} was killed by ${itemName} trying to hurt ${mobName}`,
        ]),
        ...arrCond( (mobArr && (isArr(itemArr) && itemArr.includes('weapon'))) , [
          `${user} was slain by ${mobName} using ${itemName}`,
        ]),
      ]
    } else {
      return []
    }
  },
  userStarve: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    //players/mobs
    return [
      /* `${user} starved to death`, */
  
      ...arrCond(mobArr , [
        `${user} starved to death whilst fighting ${mobName}`,
      ])
    ]
  },
  userExplodes: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Defaults
      /* `${user} blew up`,
      `${user} went off with a bang`, */
  
      //Specifics
      ...arrCond(isArr(mobArr)&&mobArr.includes('explosive') , [
        `${user} was blown up by ${mobName}`,
        `${user} went off with a bang whilst fighting ${mobName}`,
      ]),
  
      ...arrCond((mobArr && (isArr(itemArr) && itemArr.includes('explosive'))) , [
        `${user} went off with a bang due to an explosion from ${itemName} by ${mobName}`,
        `${user} was blown up by ${mobName} using ${itemName}`
      ])
    ]
  },
  // userFall: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
  //   return [
  //     //Defaults
  //     /* `${user} hit the ground too hard`,
  //     `${user} fell while climbing`,
  //     `${user} was doomed to fall`,
  //     `${user} fell from a high place`, */
  
  //     //Default Mob
  //     ...arrCond( mobArr, [
  //       `${user} hit the ground too hard whilst trying to escape ${mobName}`,
  //       `${user} was doomed to fall by ${mobName}`,
  //       `${user} fell too far and was finished by ${mobName}`,
  //     ]),
  
  //     //Default Mob&Item
  //     ...arrCond( (mobArr && itemArr), [
  //       `${user} was doomed to fall by ${mobName} using ${itemName}`
  //     ]),
  
  //     //Specifics
  //     ...arrCond( crosscheckSome(['tall', 'climbable'], itemArr), [
  //       `${user} fell off a ${itemName}`,
  //     ]),
  
  //     ...arrCond( crosscheckSome(['weapon', 'projectile', 'magical'], itemArr), [
  //       `${user} fell off a ${itemName}`,
  //     ]),
  //     ...arrCond( (mobArr && crosscheckSome(['weapon', 'projectile', 'magical'], itemArr)), [
  //       `${user} fell too far and was finished by ${mobName} using ${itemName}`,
  //     ])
  //   ]
  // },
  itemFall: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    //Specifics
    return [
      ...arrCond( crosscheckAnd(['falls', 'heavy'], itemArr), [
        `${user} was squashed by a falling ${itemName}`,
        ...arrCond( mobArr, [
          `${user} was squashed by a falling ${itemName} whilst fighting ${mobName}`,
        ])
      ])
    ]
  },
  lightning: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Defaults
      /* `${user} was struck by lightning`, */
  
      //Mob
      ...arrCond( mobArr, [
        `${user} was struck by lightning whilst fighting ${mobName}`,
      ])
    ]
  },
  magic: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Default
      /* `${user} was killed by magic`, */
  
      //specifics
      ...arrCond( isArr(mobArr)&&mobArr.includes('magical'),
      [
        `${user} was killed by ${mobName} using magic`,
        `${user} was killed by magic whilst trying to escape ${mobName}`
      ]),
  
      ...arrCond( isArr(mobArr)&&mobArr.includes('fiery'),
      [
        `${user} was fireballed by ${mobName}`
      ])
    ]
  },
  userSuffocate: ({ user, mob:{mobName, mobArr}, item:{itemName, itemArr} }) => {
    return [
      //Default
      /* `${user} suffocated in a wall`,
      `${user} was squished too much`, */
  
      //specifics
      mobArr && (
        `${user} suffocated in a wall whilst fighting ${mobName}`
      ),
  
      crosscheckSome(['thicc', 'heavy'], mobArr) && (
        `${user} was squashed by ${mobName}`
      )
    ]
  }
}