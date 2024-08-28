const supportThumbnail = 'https://media.discordapp.net/attachments/743978848692994109/814307225069682708/robo-bot-pink-blobby.png'
const { MessageEmbed, MessageAttachment } = require("discord.js");
const { betterSwitch } = require("../utils/betterSwitch");


let helpEmbed = (msg) => new MessageEmbed()
  .setAuthor('Help Command', msg.author.avatarURL())
  .addField("Everyone", "`help`, `profile`, `rank`, `xp`")
  .addField("Level 3+", "`daily`")
  .addField("Level 9+", "`fight`")
  .addField("Level 10+", "`leaderboard`, `pokemon`, `store`, `buy`, `catch`, `inventory`")
  .addField("Items", "`pokeball`, `glowing pencil`")
  .setFooter("⚠️For more info on a command, do \`>help <commandName>\`. You need a linked account to use commands!")


const helpDct = {
  help: (msg) => { return new MessageEmbed()
    .setAuthor('Help Command', msg.author.avatarURL())
    .addField("Description", "Well, you're getting the hang of it.\nDo `>help command` to get info on a specific command!")
    .addField("Also Items!", "Do `>help itemName` to see how to use an item!")
    .addField("Example", "`>help`\n`>help fight`\n`>help pokeball`")},

  rank: (msg) => { return new MessageEmbed()
    .setAuthor('Rank Command', msg.author.avatarURL())
    .addField("Description", "View your rank on the MechaKeys leaderboard")
    .addField("Arguments", "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)")
    .addField("Example", "`>rank <@362773214297849867>`\n`>rank robolab`\n`>rank`")},

  keycaps: (msg) => { return new MessageEmbed()
    .setAuthor('Keycaps Command', msg.author.avatarURL())
    .addField("Description", "See how many `keycaps` you currently have!")
    .addField("What are keycaps?", "If you somehow don't know by now... Keycaps are \"coins\", primarily earned and used in the MechaKeys app. But can also be earned and used right here on this server.")
    .addField("Example", "`>keycaps`")},

  profile: (msg) => { return new MessageEmbed()
    .setAuthor('Profile Command', msg.author.avatarURL())
    .addField("Description", "View your MechaKeys profile")
    .addField("Arguments", "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)")
    .addField("Example", "`>profile <@362773214297849867>`\n`>profile`")},

  xp: (msg) => { return new MessageEmbed()
    .setAuthor('XP Command', msg.author.avatarURL())
    .addField("Description", "View your Discord XP and Level")
    .addField("Arguments", "MechaKeys Username, @DiscordUser (Optional if you're doing the command for yourself)")
    .addField("Example", "`>xp <@362773214297849867>`\n`>xp`")},

  daily: (msg) => { return new MessageEmbed()
    .setAuthor('Daily Rewards Command', msg.author.avatarURL())
    .addField("Description", "Collect your daily reward of a random amount of keycaps or XP!")
    .addField("Level Scaling", "The higher your level, the better potential for your rewards!")
    .addField("Jackpot!", "Every time you collect a daily reward, you have a chance to win the JACKPOT!")    
    .addField("Example", "`>daily`")},

  jackpot: (msg) => { return new MessageEmbed()
    .setAuthor('Check Jackpot Command', msg.author.avatarURL())
    .addField("Description", "See Jackpot statistics, and also see how PSYCHED the Shopkeeper is about it!")
    .addField("What's the Jackpot?", "The Jackpot is a huge reward of keycaps! You have a chance to win it ALL when you collect >daily rewards!")
    .addField("Chances", "The chances are unknown, but *everyone* has the same chance to win!") 
    .addField("When does it increase?", "It has a small chance to increase every time someone does >daily!")
    .addField("Example", "`>jackpot`")},

  tip: (msg) => { return new MessageEmbed()
    .setAuthor('Tip Command', msg.author.avatarURL())
    .addField("Description", "Send someone a keycap! It's taken out of your keycap balance and added to theirs.")
    .addField("Can I Tip More?", "No, sorry. Tipping is just for fun, really. Tip when someone makes you smile!")        
    .addField("Arguments", "@DiscordUser OR discord ID (to avoid pinging)")
    .addField("Example", "`>tip @robo` || `>tip 362773214297849867`")},
  
  fight: (msg) => { return new MessageEmbed()
    .setAuthor('Fight Command', msg.author.avatarURL())
    .addField("Description", "Fight anyone! The loser gets sent to the graveyard.")
    .addField("Chances to win", "The chance of 'killing' your target is based on the XP Difference between you two.")
    .addField("Rewards", "The winner gets XP based on how hard the battle was, based on *secret* math.")
    .addField("The Graveyard", "The loser can't speak in real channels until they are revived! They can only speak in here until then... Spooky!")
    .addField("Arguments", "@DiscordUser OR discord ID (to avoid pinging)")
    .addField("Example", "`>fight @robo` || `>fight 362773214297849867`")},

  store: (msg) => { return new MessageEmbed()
    .setAuthor('Store Command', msg.author.avatarURL())
    .addField("Description", "See what's in the store! You can buy items or roles to be used on discord. The items cost keycaps!")
    .addField("Items?", "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item.")    
    .addField("Example", "`>store`")},

  buy: (msg) => { return new MessageEmbed()
    .setAuthor('Buy Command', msg.author.avatarURL())
    .addField("Description", "Buy an item from the >store! Beware, they cost **keycaps**, so check the >store for current prices!")
    .addField("Items?", "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item.")    
    .addField("Arguments", "After `>buy` just put the item name you see in the store.")
    .addField("Example", "`>buy pokeball` || `>buy glowing pencil`")},
  
  pokeball: (msg) => { return new MessageEmbed()
    .setAuthor('Pokeball Item', msg.author.avatarURL())
    .addField("Description", "You can use a pokeball to try to catch another user!")
    .addField("Chances to catch", "Similar to fighting, it is based on the XP difference of you and your target.")    
    .addField("Cost", "Using the >catch command costs **1 pokeball**, even if you fail to catch your target. Buy more in the >store.")
    .addField("Recycle!", "When you >release a pokemon you caught, you get that pokeball back!")
    .addField("Example", "`>catch @robo`")},

  inventory: (msg) => { return new MessageEmbed()
    .setAuthor('Inventory Command', msg.author.avatarURL())
    .addField("Description", "Shows your items.")
    .addField("Items?", "Items can do... a lot of stuff. Different stuff.\nTry doing `>help itemName` to get more information on how to use a specific item.")    
    .addField("Example", "`>inventory`")},

  bodyguards: (msg) => { return new MessageEmbed()
    .setAuthor('Bodyguards', msg.author.avatarURL())
    .addField("Description", "Bodyguards, a defensive role, can be bought in the >store.")
    .addField("What happens", "If you have the bodyguards role, you cannot be fought.")
    .addField("Pacifism", "Using the >fight command while you have the bodyguards role will REMOVE the role. You will need to buy it again in the >store.")},
  
  'glowing pencil': (msg) => { return new MessageEmbed()
    .setAuthor('Glowing Pencil Item', msg.author.avatarURL())
    .addField("Description", "Use this item to send a message to the future!\nYou choose how many hours into the future, and put your message in quotes.")
    .addField("What happens", "When the time comes for your message to be sent, the channel will LOCK for 10 seconds, and everyone will be FORCED to read your message!")
    .addField("Cost", "Using the >messageFuture command costs **1 glowing pencil**. Buy more in the >store.")    
    .addField("Example", "`>messageFuture 24 \"Hey everyone, I sent this exactly 24 hours ago!\"`")},

  messageFuture: (msg) => { return new MessageEmbed()
    .setAuthor('Message Future Command', msg.author.avatarURL())
    .addField("Description", "Use a glowing pencil to send a message to the future!\nYou choose how many hours into the future, and put your message in quotes.")
    .addField("What happens", "When the time comes for your message to be sent, the channel will LOCK for 10 seconds, and everyone will be FORCED to read your message!")
    .addField("Cost", "Using the >messageFuture command costs **1 glowing pencil**. Buy more in the >store.")    
    .addField("Example", "`>messageFuture 48 \"Hey frens, I sent this exactly 2 days ago!\"`")},
  
  'xp boost': (msg) => { return new MessageEmbed()
    .setAuthor('XP/Keycap Boost Role', msg.author.avatarURL())
    .addField("Description", "This role can be bought in the >store OR given to you by an admin. It is only given for a set amount of time.")
    .addField("What's a Boost?", "Whenever you would gain XP or Keycaps on Discord, it **DOUBLES**.")
    .addField("Permanent Boosts", "If you buy keycaps in-app, you get a permanent <@&745750711584948316> role which has the same effect.\nBoosting the server with Nitro gives you the <@&675783015238074369> role for as long as you boost the server.")}
}


module.exports.help = async (msg, { args }) => {
  let command = args[0] ? args[0].toLowerCase() : ''
  command = command ? args.join(' ') : '' // join entire array into one string for 'spaced' names
  var embed = betterSwitch(helpDct)(helpEmbed)(command, msg)
    .setThumbnail(supportThumbnail)
    .setColor("2f3136")
  msg.channel.send(embed)
}
