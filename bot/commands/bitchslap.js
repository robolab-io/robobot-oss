const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const xpRequirement = { xp: 2000, level: 10 };
const xpBot = require('../utils/xpBot');
const pyroBar = require('../utils/pyroBar');
const env = process.env.env || 'staging'; // production or staging
const isBooster = require('../utils/isBooster');
const { devAPI, discordAPI } = require("robo-bot-utils");
const { ids } = require('../ids');
const records = require('../utils/records');
const wait = require('../utils/wait');
let lastUserFight = {};
let userConsecutiveDeathCount = {};

const generateFightMessage = (fighter1, victim1, win) => {
  // ... (rest of the function remains the same)
};

module.exports = {
  alias: ['bitchslap'],
  data: new SlashCommandBuilder()
    .setName("bitchslap")
    .setDescription("Bitchslap another user!")
    .addUserOption(option =>
      option.setName("target")
        .setDescription("The user to bitchslap")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const client = interaction.client;
    const guild = interaction.guild;
    const guildIDs = ids[guild.id];

    let recentFights = [
      // ... (array content remains the same)
    ];

    let recentFightsEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Dude, calm down!`, iconURL: interaction.user.avatarURL() })
      .setDescription(recentFights[Math.floor(Math.random() * recentFights.length)] + `\n ${lastUserFight[interaction.user.id] ? (36000 - (Date.now() - lastUserFight[interaction.user.id].time))/1000 : 'Many'} seconds left!`);

    if (lastUserFight[interaction.user.id] && (Date.now() - lastUserFight[interaction.user.id].time) < 36000) {
      return interaction.editReply({ embeds: [recentFightsEmbed] });
    }

    const { useGames } = require('../games/gameState');
    let currentGames = useGames();
    if (currentGames[interaction.channelId]) {
      if (!!currentGames[interaction.channelId].bombsquad) {
        return interaction.editReply(`<@${interaction.user.id}>... dawg.. there's a BOMB GOING OFF. STOP FIGHTING.`);
      }
    }

    // Embeds
    let ghostFightEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Bitchslapping as a Ghost`, iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${interaction.user.id}>, you can't bitchslap as a ghost! I mean, you can, but it wouldn't do anything.`);

    let graveyardFightEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Bitchslapping in the Graveyard`, iconURL: interaction.user.avatarURL() })
      .setDescription("You can't bitchslap while you're dead! You can't even move your body, let alone slap someone like a little girl!");

    let xpReqEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Under Level 10`, iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${interaction.user.id}>, you need to be \`level ${xpRequirement.level}\` to bitchslap!`);

    if (interaction.channelId === guildIDs.graveyard) {
      return interaction.editReply({ embeds: [graveyardFightEmbed] });
    }

    // check xp requirement
    const userXP = (await xpBot.getXP(interaction.user.id))?.data;
    if (!userXP || userXP.discordXP < xpRequirement.xp) {
      return interaction.editReply({ embeds: [xpReqEmbed] });
    }

    const authorUser = guild.members.cache.get(interaction.user.id);

    if (authorUser.roles.cache.get(guildIDs.Ghost)) {
      return interaction.editReply({ embeds: [ghostFightEmbed] });
    }

    if (authorUser.roles.cache.get(guildIDs.Dead)) {
      return interaction.editReply(`<@${interaction.user.id}>, you're dead!`);
    }

    const victim = interaction.options.getUser("target");
    if (!victim) {
      return interaction.editReply("You need to mention someone to bitchslap!");
    }

    let bodyguardsEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Bodyguards`, iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${victim.id}>'s hired bodyguards pushed you away!\n And you broke a nail in the process. Time for a manicure!`);

    let alreadyDeadEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Can't Bitchslap Dead People!`, iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${victim.id}> is dead! Why would you slap a dead body?`);

    let fightGhostEmbed = new EmbedBuilder()
      .setColor("2f3136")
      .setAuthor({ name: `Can't Bitchslap Ghosts!`, iconURL: interaction.user.avatarURL() })
      .setDescription(`<@${victim.id}> is a ghost! Your slap would just make ghastly air swirl around!`);

    const wouldBeVictim = guild.members.cache.get(victim.id);
    if (!wouldBeVictim) {
      return interaction.editReply("Invalid user mentioned!");
    }

    if (wouldBeVictim.roles.cache.get('811255216128786503')) {
      return interaction.editReply({ embeds: [bodyguardsEmbed] });
    }
    if (wouldBeVictim.roles.cache.get(guildIDs.Dead)) {
      return interaction.editReply({ embeds: [alreadyDeadEmbed] });
    }
    if (wouldBeVictim.roles.cache.get(guildIDs.Ghost)) {
      return interaction.editReply({ embeds: [fightGhostEmbed] });
    }

    // slapper discord
    let slapper_discord_obj = await discordAPI.getUser(interaction.user.id);
    if (!slapper_discord_obj || !slapper_discord_obj.success) {
      return interaction.editReply(`<@${interaction.user.id}>, error grabbing your discord data.`);
    }
    slapper_discord_obj = slapper_discord_obj.data;
    let notEnoughItemsEmb = new EmbedBuilder()
      .setTitle("You don't have any bitchslaps!")
      .setDescription(`<a:red_siren:812813923522183208> <@${interaction.user.id}>, you need to buy more Bitchslaps! Check the \`/store\`!`)
      .setColor("2f3136");
    if (!slapper_discord_obj.bitchslapCount) {
      return interaction.editReply({ embeds: [notEnoughItemsEmb] });
    }

    // deduct ball from slapper
    let deduct_slap = await discordAPI.deductField(interaction.user.id, 'bitchslapCount', 'big_butt');
    if (!deduct_slap.success) {
      return interaction.editReply(`<@${interaction.user.id}>, something went wrong when bitchslapping!`);
    }

    // Fighter has bodyguards and will now lose them.
    if (authorUser.roles.cache.get('811255216128786503')) {
      authorUser.roles.remove('811255216128786503');
    }

    userConsecutiveDeathCount[interaction.user.id] = 0; // user just fought, reset their cons death count
    let victimXP = (await xpBot.getXP(victim.id))?.data?.discordXP || 0;

    // (victim/fighter)/2
    const fighterXP = userXP.discordXP || 1;

    const calcWin = (victimXP, fighterXP) => {
    if (prepVictimId === '747491742214783117') {
      if (victimXP > fighterXP) {
        const chance = (((fighterXP + 1)/victimXP) / 2) - 0.005
        return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
      } else {
        const chance = (((victimXP + 1)/fighterXP) / 2) + 0.005
        return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
      }
    }
    if (victimXP > fighterXP) {
      const chance = (((fighterXP + 1)/victimXP) / 2) - 0.25
      return {win:Math.random() < chance, chance: Math.round((chance*100)*1000)/1000 }
    } else {
      const chance = (((victimXP + 1)/fighterXP) / 2) + 0.25
      return {win:Math.random() > chance, chance: Math.round(((1-chance)*100)*1000)/1000 }
    }
  }
  const winObject = calcWin(victimXP, fighterXP)
  const win = winObject.win

    const chanceToWinPretty = winObject.chance;
    const winnerId = win ? interaction.user.id : victim.id;
    const loserId = win ? victim.id : interaction.user.id;
    const loserUsername = client.users.cache.get(loserId);
    let prize = 1;
    const xp_function = (chance) => {
      return Math.round(Math.min(Math.max((10 / (chance / 100)) - 8, 2), 10000)); // Minimum of 2, Maximum of 10000
    };

    const boosterMult = isBooster(guild, winnerId) ? 2 : 1;
    let footer = winnerId === loserId ? 'You...slapped yourself to death?' : (`${interaction.user.username} had a ${chanceToWinPretty}% chance to win!` + ` || ${win ? interaction.user.username : wouldBeVictim.user.username} +${prize * boosterMult} XP`);

    let firstemb = new EmbedBuilder()
      .setImage(`${generateFightMessage(interaction.user.id, victim.id, win)}`)
      .setTitle(interaction.user.username + ' BITCHSLAPPED ' + wouldBeVictim.user.username + '!')
      .setFooter({ text: footer })
      .setColor(win ? '3eaf7c' : 'da3b3b');
    let secondemb = new EmbedBuilder()
      .setTitle(loserUsername.username + ` is now dead!`)
      .setDescription("💀 to stay dead.")
      .setFooter({ text: "No praying here! You can only extend this death." })
      .setColor(win ? '3eaf7c' : 'da3b3b');

    if (wouldBeVictim.user.id === '747491742214783117') {
      secondemb.setThumbnail('https://mechakeys.robolab.io/discord/media/events/falling/angry_robo03.gif');
    }

    const firstMsg = await interaction.editReply({ embeds: [firstemb] });
    const secondMsg = await interaction.channel.send({ embeds: [secondemb] });
    secondMsg.react('💀');

    const deadAmount = 10000; // Base milliseconds for being dead
    const deadStart = Date.now(); // Time that dead started
    let deadrole = guild.roles.cache.get(guildIDs.Dead); //Dead role
    let ghostrole = guild.roles.cache.get(guildIDs.Ghost); // Ghost role
    const deadUser = guild.members.cache.get(loserId); // Dead user object
    discordAPI.incrementField(deadUser.id, 'deathCount', 'big_butt');
    deadUser.roles.add(deadrole); // Add dead role to user who died
    const graveyard = guild.channels.cache.get(guildIDs.graveyard); // Graveyard channel
    const graveyardMessage = await graveyard.send(`<@${loserId}>, you died from a **bitchslap!** That's embarrassing.`);

    let kekMultiplier = 0; // Milliseconds to extend death timer (extra based on Kek votes)
    let stillDead = true; // Interval helper for being dead
    const checker = setInterval(() => {
      const kek = secondMsg.reactions.cache.get('💀') || {};
      const kekCount = kek.count || 1;
      kekMultiplier = (kekCount - 1) * 120000;

      if (Date.now() > deadStart + deadAmount + kekMultiplier) {
        stillDead = false;
        clearInterval(checker);
        deadUser.roles.remove(ghostrole);
        deadUser.roles.remove(deadrole);
        let revivedEmbed = new EmbedBuilder()
          .setColor("2f3136")
          .setDescription(`<:bodyguards:816114055030767638> <@${loserId}> **has been resurrected!** <:bodyguards:816114055030767638>`);
        interaction.channel.send(`revived! <@${loserId}>`).then(m => { m.delete(); });
        return interaction.channel.send({ embeds: [revivedEmbed] });
      }
    }, 4506);

    if (victim.id === loserId) {
      userConsecutiveDeathCount[loserId] = userConsecutiveDeathCount[loserId] || 1;
      userConsecutiveDeathCount[loserId]++;
    }

    lastUserFight[interaction.user.id] = lastUserFight[interaction.user.id] || { time: Date.now() };
    lastUserFight[interaction.user.id].time = Date.now();
    setTimeout(() => {
      if (victim.id === interaction.user.id) { return; }
      if (win) {
        pyroBar.fillDatBoost(interaction.client, 3, '462274708499595266', 10);
        xpBot.giveXP(interaction.user, prize, interaction.channel, client);
      } else {
        xpBot.giveXP(guild.members.cache.get(victim.id), prize, interaction.channel, client);
      }
    }, 3000);
  }
};