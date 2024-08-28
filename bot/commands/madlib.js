const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const commandAccumulator = require("../utils/commandAccumulator");
const madlibHandler = require('./gameHandler/madlibHandler');
const { useGames } = require('../games/gameState');

const embed = (interaction) => new EmbedBuilder()
  .setColor('#800080')
  .setImage('https://images.penguinrandomhouse.com/cover/9780399541711')
  .setFooter({ text: 'Just follow the prompts!', iconURL: 'https://mechakeys.robolab.io/discord/media/alert.png' })
  .setDescription(`<@${interaction.user.id}> triggered a minigame!`);

const presets = (interaction) => ([
  `there once was a {{character=noun}} who tried to join the {{any(Discord Server)}} discord server, but {{character}} was instantly banned for committing {{any(Crime)}}!!!`,
  `${interaction.user}'s new nick name will be {{any(Name)}}'`,
  `${interaction.user} likes to eat {{any(Food)}}`,
  `you're just not cultured enough to understand my {{any(Fetish)}}`,
  `that time I was reincarnated in another {{place = any(Place)}} as a(n) {{any(Thing)}} who must now {{any(Life Goal)}} before the demon {{any(Thing)}} destroys the {{place}}!`
]);

const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  alias: ['adlib', 'adlibs', 'ad', 'madlib', 'madlibs', 'ml'],
  data: new SlashCommandBuilder()
    .setName("adlib")
    .setDescription("Start an Adlib game")
    .addStringOption(option => 
      option.setName("template")
        .setDescription("Custom Adlib template (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    const channelObj = interaction.channel;
    let currentGames = useGames();
    let channelGame = currentGames[channelObj.id] || {};

    if (channelGame && channelGame.adlib) {
      return interaction.reply("Adlib already active!");
    }

    // command rate limiter
    const out_of_uses = !(await commandAccumulator(interaction, 'adlib', false, true));
    if (out_of_uses) return;

    if (interaction.options.getString("template") === 'help') {
      return interaction.reply(`\`\`\`
      command: [adlib, adlibs, ad, madlib, madlibs, ml]

      syntax:
         POS stands for "Part of Speech", ie noun, verb, adjective, etc.
         {{POS}} {{POS(specifier)}} {{any(Any Thing Without Validation)}}
         {{variableName = POS(optionalSpecifier)}}  {{variableName}}

      example:
        /adlib template:"there once was a {{character=noun}} who tried to join the {{any(Discord Server)}} discord server, but {{character}} was instantly banned for committing {{any(Crime)}}!!!"
      \`\`\``);
    }

    // Init Adlib obj to handle order of asking and filling in the "blanks"
    const gameObj = {
      currentIndex: 0,
      blankIndexes: [],
      textArr: [],
      variables: {},
      promptReplies: [],
      lastUser: ''
    };

    // match all occurrences of {{var = key(arguments)}}
    const pattern = /\{\{((\w+?)([\s]+)?=([\s]+)?)?(\w+?)(\((.*?)\))?\}\}/;

    // remove command from input
    const preParseStr = interaction.options.getString("template") || rnd(presets(interaction));
    let str = preParseStr;

    gameObj['textArr'] = str.split(/(\{\{.*?\}\})/g).map((el, i) => {
      const m = el.match(pattern);
      if (m) {
        gameObj['blankIndexes'].push(i);
        if (m[5] in gameObj['variables']) { 
          // Catch existing variable
          return {
            ref: gameObj['variables'][m[5]]
          };
        } else {
          // If assignment, create new variable
          if (m[2]) gameObj['variables'][m[2]] = i;

          // define new "blank"
          return {
            index: i,
            var: m[2],
            key: m[5],
            arg: m[7]
          };
        }
      } else {
        // return non-blank text
        return el;
      }
    });
    console.log(gameObj['textArr']);

    // Assign new game instance to currentGames object
    if (currentGames[channelObj.id]) {
      currentGames[channelObj.id].adlib = gameObj;
    } else {  
      currentGames[channelObj.id] = {
        adlib: gameObj
      };
    }

    // Send embed to start the game
    await interaction.reply({ embeds: [embed(interaction)] });

    // Send first prompt
    madlibHandler(interaction, gameObj, currentGames, true);
  }
};