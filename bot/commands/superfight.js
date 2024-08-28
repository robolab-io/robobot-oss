const { EmbedBuilder, Client, CommandInteraction, PermissionFlagsBits } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 };
const xpBot = require('./../utils/xpBot');
const pyroBar = require('./../utils/pyroBar');
const { devAPI, discordAPI } = require("robo-bot-utils");
const env = process.env.env || 'staging'; // production or staging
const isBooster = require('../utils/isBooster');
const { ids: idKey } = require('../ids');
const commandLimiter = require('./../utils/commandLimiter');
const records = require('../utils/records');
const wait = require('../utils/wait');
let lastUserFight = {};
let userConsecutiveDeathCount = {};

const generateFightMessage = (fighter1, victim1, win) => {
  const fighter = `<@${fighter1}>`;
  const victim = `<@${victim1}>`;
  const winGifs = [
    `https://media1.tenor.com/images/5237f4838c5786ea3d3fd0276d7fd46b/tenor.gif`,
    `https://media1.tenor.com/images/b55aace72003e3fa100c208c8fefe250/tenor.gif`,
    `https://media1.tenor.com/images/d14969a21a96ec46f61770c50fccf24f/tenor.gif`,
    `https://media1.tenor.com/images/514b5ebea579416c0bcc28370184d6dd/tenor.gif`,
    `https://media1.tenor.com/images/3c95ca85f89068660becde7a31f0f04d/tenor.gif`,
    `https://media1.tenor.com/images/9d069ae25a01d92d62666ead2d84a0ed/tenor.gif`,
    `https://media1.tenor.com/images/ee3f2a6939a68df9563a7374f131fd96/tenor.gif`,
    `https://media1.tenor.com/images/fa2614e3f1bc91c212aee25cb1cadbe8/tenor.gif`,
    `https://media1.tenor.com/images/cb8bcd7c0d6c46fa8203a3c4edcb0ad7/tenor.gif`,
    `https://media1.tenor.com/images/175cf269b6df62b75a5d25a0ed45e954/tenor.gif`,
    `https://media1.tenor.com/images/e3a7b35927adda8167131a534553ac6d/tenor.gif`,
    `https://media1.tenor.com/images/2e36b49b3d26d1e2fe014e5d4c1dbc75/tenor.gif`,
    `https://media1.tenor.com/images/bfb2e611643bd89d0a02f20633df4566/tenor.gif`,
    `https://c.tenor.com/N88D2aVoSVMAAAAC/anime-fight.gif`,
    `https://c.tenor.com/rjR2Z67erfkAAAAd/death-saitama.gif`,
    `https://cdn.discordapp.com/attachments/751665008869376010/882448857219354624/ezgif.com-video-to-gif.gif`,
  ];

  const loseGifs = [
    `https://media1.tenor.com/images/892772bb2f07802d6dd1d81d8addc495/tenor.gif`,
  ];

  // TODO: Make this bot in config
  if (victim1 === '747491742214783117') {
    return win
      ? winGifs[Math.floor(Math.random() * winGifs.length)]
      : loseGifs[Math.floor(Math.random() * loseGifs.length)];
  }

  return win
    ? winGifs[Math.floor(Math.random() * winGifs.length)]
    : loseGifs[Math.floor(Math.random() * loseGifs.length)];
};

module.exports = {
  alias: ['superfight'],
  data: new SlashCommandBuilder()
    .setName('superfight')
    .setDescription('Engage in a superfight with another user!')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to fight')
        .setRequired(true)),
  async execute(interaction) {
    const args = interaction.options.getUser('user');
    const client = interaction.client;
    const guild = client.guilds.cache.get(interaction.guild.id);
    const guildIDs = idKey[interaction.guild.id];

    const recentFights = [
      "How many fists of doom do you even have?!? You're like the Jeff Bezos of Doomfisting people!",
      "Jeff Bezos doesn't even abuse people as much as you abuse your fist of doom!",
      "You might break an arm!",
      "Maybe you could.. you know.. start a conversation with less annoying people",
      "Dude, you already KILLED someone else for so long! You gotta be considerate.",
      "Pass the time by fighting me, Robo-bot, instead!",
      "Why don't you >bitchslap someone instead?",
      "Isn't it time to claim your daily?",
      "hey bud, it might be time to take some anger management classes",
      "You can watch a movie in this time!",
      "You can get a job in this time!",
      "You can buy keycaps in this time!",
      "The fist has to rest sometimes, too.",
      "Don't you care about the fist's feelings?",
      "Lol made you wait, bitch. Fist THIS!!",
    ];

    if (commandLimiter(interaction)) return;

    let recentFightsEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: 'Dude, calm down!', iconURL: interaction.user.avatarURL() })
      .setDescription(recentFights[Math.floor(Math.random() * recentFights.length)] + `\n ${lastUserFight[interaction.user.id] ? (3600000 - (Date.now() - lastUserFight[interaction.user.id].time)) / 1000 : 'Many'} seconds left!`);

    if (lastUserFight[interaction.user.id] && (Date.now() - lastUserFight[interaction.user.id].time) < 3600000) {
      await interaction.reply({ embeds: [recentFightsEmbed] });
      return; // too soon since last message
    }

    if (currentGames[interaction.channel.id]) {
      if (!!currentGames[interaction.channel.id].bombsquad) {
        await interaction.reply(`<@${interaction.user.id}>... dawg.. there's a BOMB GOING OFF. STOP FIGHTING.`);
        return; // fight during bombsquad
      }
    }

    // Embeds
    let ghostFightEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: 'Superfighting as a Ghost', iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${interaction.user.id}>, you can't superfight as a ghost! You can't even wear a Fist of Doom! It would just fall through your ghost hands, or paws, I'm not sure if you're a furry or something. Also even if you weren't a ghost, honestly the Fist of Doom is like a size 10 in Men's. You might be better off getting the \`bitchslapper\` instead.`);

    let graveyardFightEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: 'Superfighting in the Graveyard', iconURL: interaction.user.avatarURL() })
      .setDescription("You can't superfight while you're dead! You can't even move your body, let alone pick up a Fist of Doom!!");

    let xpReqEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: 'Under Level 9', iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${interaction.user.id}>, you need to be \`level ${xpRequirement.level}\` to superfight!`);

    let noArgsEmb = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: 'Mention Someone!', iconURL: interaction.user.avatarURL() })
      .setDescription("You can't superfight nobody! You need to @mention someone in this Discord!");

    if (interaction.channel.id === guildIDs.graveyard) {
      return await interaction.reply({ embeds: [graveyardFightEmbed] });
    }

    // Check XP requirement
    const userXP = (await xpBot.getXP(interaction.user.id))?.data;
    if (!userXP || userXP.discordXP < xpRequirement.xp) {
      return await interaction.reply({ embeds: [xpReqEmbed] });
    }
    const authorUser = guild.members.cache.get(interaction.user.id);

    if (authorUser.roles.cache.has(guildIDs.Ghost)) {
      return await interaction.reply({ embeds: [ghostFightEmbed] });
    }

    // Fallback in case user can talk in other channels
    if (authorUser.roles.cache.has(guildIDs.Dead)) {
      return await interaction.reply(`<@${interaction.user.id}>, you're dead!`);
    }

    // No user provided
    if (!args) {
      return await interaction.reply({ embeds: [noArgsEmb] });
    }

    // If user is the same as the author
    if (interaction.user.id === args.id) {
      return await interaction.reply(`<@${interaction.user.id}> you can't fight yourself!`);
    }

    const victim = guild.members.cache.get(args.id);

    if (victim?.user.bot) {
      return await interaction.reply("You can't fight a bot!");
    }

    // Check if victim is a ghost or dead
    if (victim.roles.cache.has(guildIDs.Ghost)) {
      return await interaction.reply(`<@${victim.user.id}> is a ghost!`);
    }
    if (victim.roles.cache.has(guildIDs.Dead)) {
      return await interaction.reply(`<@${victim.user.id}> is dead!`);
    }

    // Save the fight info
    lastUserFight[interaction.user.id] = {
      time: Date.now(),
      opponent: args.id
    };

    const { xpReward } = await records.updateRecord(interaction.user.id);

    if (!xpReward) {
      return await interaction.reply("Something went wrong while fetching the XP reward.");
    }

    const msg = await interaction.reply({
      content: `<@${args.id}> get ready! **<@${interaction.user.id}>** is challenging you to a superfight!`,
      fetchReply: true
    });

    const fightMessage = generateFightMessage(interaction.user.id, args.id, Math.random() > 0.5);

    await wait(2000);
    await msg.reply(fightMessage);
    await wait(2000);

    const embed = new EmbedBuilder()
      .setColor("2f3136")
      .setDescription(`${interaction.user.username} has won the fight and received ${xpReward} XP!`)
      .setAuthor({ name: 'Superfight', iconURL: interaction.user.avatarURL() });

    await interaction.channel.send({ embeds: [embed] });
  },
};
