const { MessageEmbed } = require("discord.js")
const commandAccumulator = require("../utils/commandAccumulator")
const adlibHandler = require('./gameHandler/adlibHandler');

const embed = (msg) => new MessageEmbed()
  .setColor('#800080')
  .setImage('https://images.penguinrandomhouse.com/cover/9780399541711')
  .setFooter('Just follow the prompts!', 'https://mechakeys.robolab.io/discord/media/alert.png')
  .setDescription(`<@${msg.author.id}> triggered a minigame!`)

const presets = (msg) => ([
  "there once was a {{character=noun}} who tried to join the {{any(Discord Server)}} discord server, but {{character}} was instantly banned for committing {{any(Crime)}}!!!",
  `${msg.author}'s new nick name will be {{any(Name)}}'`,
  `${msg.author} likes to eat {{any(Food)}}`,
  `you're just not cultured enough to understand my {{any(Fetish)}}`,
  `that time I was reincarnated in another {{place = any(Place)}} as a(n) {{any(Thing)}} who must now {{any(Life Goal)}} before the demon {{any(Thing)}} destroys the {{place}}!`
])

const rnd = (arr) => { return arr[Math.floor(Math.random() * arr.length)] };

module.exports.adlib = async (msg, {args, currentGames, emojis, developerAPI }) => {
  /* Handle new Adlib game event */
  const channelObj = msg.channel
  let channelGame = currentGames[channelObj.id] || {} // inherit else init new obj
  if (channelGame && channelGame.adlib) {
    channelObj.send("Adlib already active!")
    return currentGames
  }

  // command rate limiter
  const out_of_uses = !(await commandAccumulator(msg, 'adlib'))
  if (out_of_uses) return currentGames

  if (args[0] === 'help' ) {
    msg.channel.send(`\`\`\`
    command: [adlib, adlibs, ad, madlib, madlibs, ml]

    syntax:
       POS stands for "Part of Speech", ie noun, verb, adjective, etc.
       {{POS}} {{POS(specifier)}} {{any(Any Thing Without Validation)}}
       {{variableName = POS(optionalSpecifier)}}  {{variableName}}
    
    example:
      >>ad there once was a {{character=noun}} who tried to join the {{any(Discord Server)}} discord server, but {{character}} was instantly banned for committing {{any(Crime)}}!!!')
    \`\`\``)
    return currentGames
  }

  // Init Adlib obj to handle order of asking and filling in the "blanks"
  const gameObj = {
    currentIndex: 0,
    blankIndexes: [],
    textArr: [],
    variables: {},
    promptReplies: [],
    lastUser: ''
  }

  // match all occurrences of {{var = key(arguments)}}
  const pattern = /\{\{((\w+?)([\s]+)?=([\s]+)?)?(\w+?)(\((.*?)\))?\}\}/ // .*? allows multi word answers for any(args)

  // remove command from input
  const preParseStr = args.length < 1? rnd(presets(msg)): msg.content
  let str = preParseStr.replace(/^(>|>>)\w+\s+/, '')

  gameObj['textArr'] = str.split(/(\{\{.*?\}\})/g).map((el, i) => {
    const m = el.match(pattern)
    if (m) {
      gameObj['blankIndexes'].push(i)
      if (m[5] in gameObj['variables']) { 
        // Catch existing variable
        return {
          ref: gameObj['variables'][m[5]]
        }
      } else {
        // If assignment, create new variable
        if (m[2]) gameObj['variables'][m[2]] = i

        // define new "blank"
        return {
          index: i,
          var: m[2],
          key: m[5],
          arg: m[7]
        }
      }
    } else {
      // return non-blank text
      return el
    }
  })
  console.log(gameObj['textArr'])
  
  // Assign new game instance to currentGames object
  if (currentGames[channelObj.id]) {
    currentGames[channelObj.id].adlib = gameObj
  } else {  
    currentGames[channelObj.id] = {
      adlib: gameObj
    }
  }

  // delete command from channel
  msg.delete()

  // Send embed to start the game
  channelObj.send(embed(msg))


  // Send first prompt
  adlibHandler(msg, gameObj, currentGames, developerAPI, true)

  return currentGames
}
