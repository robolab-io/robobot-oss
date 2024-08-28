// This is a little redundant given how slash commands and args have descriptions

const supportThumbnail = 'https://media.discordapp.net/attachments/743978848692994109/814307225069682708/robo-bot-pink-blobby.png';
const { EmbedBuilder } = require("discord.js");
const { betterSwitch } = require("../utils/betterSwitch");

let helpEmbed = (interaction) => new EmbedBuilder()
  .setAuthor({ name: 'Help Command', iconURL: interaction.user.avatarURL() })
  .addFields(
    { name: "Everyone", value: "`help`, `profile`, `rank`, `xp`" },
    { name: "Level 3+", value: "`daily`" },
    { name: "Level 9+", value: "`fight`" },
    { name: "Level 10+", value: "`leaderboard`, `pokemon`, `store`, `buy`, `catch`, `inventory`" },
    { name: "Items", value: "`pokeball`, `glowing pencil`" }
  )
  .setFooter({ text: "⚠️For more info on a command, do `>help <commandName>`. You need a linked account to use commands!" });

const helpDct = {
  help: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Help Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Well, you're getting the hang of it.\nDo `>help command` to get info on a specific command!" },
      { name: "Also Items!", value: "Do `>help itemName` to see how to use an item!" },
      { name: "Example", value: "`>help`\n`>help fight`\n`>help pokeball`" }
    ),

  rank: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Rank Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "View your rank on the MechaKeys leaderboard" },
      { name: "Arguments", value: "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)" },
      { name: "Example", value: "`>rank <@362773214297849867>`\n`>rank robolab`\n`>rank`" }
    ),

  keycaps: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Keycaps Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "See how many `keycaps` you currently have!" },
      { name: "What are keycaps?", value: "If you somehow don't know by now... Keycaps are \"coins\", primarily earned and used in the MechaKeys app. But can also be earned and used right here on this server." },
      { name: "Example", value: "`>keycaps`" }
    ),

  profile: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Profile Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "View your MechaKeys profile" },
      { name: "Arguments", value: "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)" },
      { name: "Example", value: "`>profile <@362773214297849867>`\n`>profile`" }
    ),

  xp: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'XP Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "View your Discord XP and Level" },
      { name: "Arguments", value: "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)" },
      { name: "Example", value: "`>xp <@362773214297849867>`\n`>xp`" }
    ),

  daily: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Daily Rewards Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Collect your daily reward of a random amount of keycaps or XP!" },
      { name: "Level Scaling", value: "The higher your level, the better potential for your rewards!" },
      { name: "Jackpot!", value: "Every time you collect a daily reward, you have a chance to win the JACKPOT!" },
      { name: "Example", value: "`>daily`" }
    ),

  jackpot: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Check Jackpot Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "See Jackpot statistics, and also see how PSYCHED the Shopkeeper is about it!" },
      { name: "What's the Jackpot?", value: "The Jackpot is a huge reward of keycaps! You have a chance to win it ALL when you collect >daily rewards!" },
      { name: "Chances", value: "The chances are unknown, but *everyone* has the same chance to win!" },
      { name: "When does it increase?", value: "It has a small chance to increase every time someone does >daily!" },
      { name: "Example", value: "`>jackpot`" }
    ),

  tip: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Tip Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Send someone a keycap! It's taken out of your keycap balance and added to theirs." },
      { name: "Can I Tip More?", value: "No, sorry. Tipping is just for fun, really. Tip when someone makes you smile!" },
      { name: "Arguments", value: "@DiscordUser OR discord ID (to avoid pinging)" },
      { name: "Example", value: "`>tip @robo` || `>tip 362773214297849867`" }
    ),

  fight: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Fight Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Fight anyone! The loser gets sent to the graveyard." },
      { name: "Chances to win", value: "The chance of 'killing' your target is based on the XP Difference between you two." },
      { name: "Rewards", value: "The winner gets XP based on how hard the battle was, based on *secret* math." },
      { name: "The Graveyard", value: "The loser can't speak in real channels until they are revived! They can only speak in here until then... Spooky!" },
      { name: "Arguments", value: "@DiscordUser OR discord ID (to avoid pinging)" },
      { name: "Example", value: "`>fight @robo` || `>fight 362773214297849867`" }
    ),

  store: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Store Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "See what's in the store! You can buy items or roles to be used on discord. The items cost keycaps!" },
      { name: "Items?", value: "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item." },
      { name: "Example", value: "`>store`" }
    ),

  buy: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Buy Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Buy an item from the >store! Beware, they cost **keycaps**, so check the >store for current prices!" },
      { name: "Items?", value: "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item." },
      { name: "Arguments", value: "After `>buy` just put the item name you see in the store." },
      { name: "Example", value: "`>buy pokeball` || `>buy glowing pencil`" }
    ),

  pokeball: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Pokeball Item', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "You can use a pokeball to try to catch another user!" },
      { name: "Chances to catch", value: "Similar to fighting, it is based on the XP difference of you and your target." },
      { name: "Cost", value: "Using the >catch command costs **1 pokeball**, even if you fail to catch your target. Buy more in the >store." },
      { name: "Recycle!", value: "When you >release a pokemon you caught, you get that pokeball back!" },
      { name: "Example", value: "`>catch @robo`" }
    ),

  inventory: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Inventory Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Shows your items." },
      { name: "Items?", value: "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item." },
      { name: "Example", value: "`>inventory`" }
    ),

  bodyguards: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Bodyguards', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Bodyguards, a defensive role, can be bought in the >store." },
      { name: "What happens", value: "If you have the bodyguards role, you cannot be fought." },
      { name: "Pacifism", value: "Using the >fight command while you have the bodyguards role will REMOVE the role. You will need to buy it again in the >store." }
    ),
  
  'glowing pencil': (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Glowing Pencil Item', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Use this item to send a message to the future!\nYou choose how many hours into the future, and put your message in quotes." },
      { name: "What happens", value: "When the time comes for your message to be sent, the channel will LOCK for 10 seconds, and everyone will be FORCED to read your message!" },
      { name: "Cost", value: "Using the >messageFuture command costs **1 glowing pencil**. Buy more in the >store." },
      { name: "Example", value: "`>messageFuture 24 \"Hey everyone, I sent this exactly 24 hours ago!\"`" }
    ),

  messageFuture: (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'Message Future Command', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "Use a glowing pencil to send a message to the future!\nYou choose how many hours into the future, and put your message in quotes." },
      { name: "What happens", value: "When the time comes for your message to be sent, the channel will LOCK for 10 seconds, and everyone will be FORCED to read your message!" },
      { name: "Cost", value: "Using the >messageFuture command costs **1 glowing pencil**. Buy more in the >store." },
      { name: "Example", value: "`>messageFuture 48 \"Hey frens, I sent this exactly 2 days ago!\"`" }
    ),
  
  'xp boost': (interaction) => new EmbedBuilder()
    .setAuthor({ name: 'XP/Keycap Boost Role', iconURL: interaction.user.avatarURL() })
    .addFields(
      { name: "Description", value: "This role can be bought in the >store OR given to you by an admin. It is only given for a set amount of time." },
      { name: "What's a Boost?", value: "Whenever you would gain XP or Keycaps on Discord, it **DOUBLES**." },
      { name: "Permanent Boosts", value: "If you buy keycaps in-app, you get a permanent <@&745750711584948316> role which has the same effect.\nBoosting the server with Nitro gives you the <@&675783015238074369> role for as long as you boost the server." }
    )
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Provides help information')
    .addStringOption(option => 
      option
        .setName('command')
        .setDescription('The command to get help with')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    // Retrieve the command argument
    let command = interaction.options.getString('command') ? interaction.options.getString('command').toLowerCase() : '';
    command = command ? command : ''; // Use command as it is since join is not needed for a single string

    // Generate the embed
    const embed = betterSwitch(helpDct)(helpEmbed)(command, interaction)
      .setThumbnail(supportThumbnail)
      .setColor(0x2f3136);

    // Reply with the embed
    await interaction.reply({ embeds: [embed] });
  }
};

//https://gist.github.com/joelnet/9f0ec931e37bb3ed6d8f434ba908b715
const executeIfFunction = (f, msg, state) =>
  typeof f === 'function' ? f(msg, state) : f

const switchcase = cases => defaultCase => key =>
  cases.hasOwnProperty(key) ? cases[key] : defaultCase

// Switch alternative witch function support
const switchcaseF = cases => defaultCase => (key, msg, state = false) =>
  executeIfFunction(switchcase(cases)(defaultCase)(key), msg, state)

// Executes an object with a default.
const betterSwitch = switchcaseF
