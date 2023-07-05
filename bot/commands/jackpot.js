//

const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { discordAPI } = require("robo-bot-utils");
const xpRequirement = { xp: 150 };
const xpBot = require("../utils/xpBot");

function timeConversion(millisec) {
  let seconds = Math.round(millisec / 1000);
  let minutes = Math.round(millisec / (1000 * 60));
  let hours = Math.round(millisec / (1000 * 60 * 60));
  let days = Math.round(millisec / (1000 * 60 * 60 * 24));

  if (seconds < 60) {
    return seconds + " seconds";
  } else if (minutes < 60) {
    return minutes + " minutes";
  } else if (hours < 24) {
    return hours + " hours";
  } else {
    return days + " days";
  }
}

const jackpot_descriptor_map = {
  300: [
    "Looks like it's just getting started!",
    "Aye, that'd be a sad jackpot to win.",
    "This is a little baby jackpot! Useless!",
    "Not much yet, like all good things, it takes time.",
    "Give it time, and soon this jackpot will be bigger than you can even DREAM of!!! Ho ho!",
  ], // 0-300

  500: [
    "Not too sizeable yet, but it's making good progress.",
    "This one's gonna take a while-- I can feel it.",
    "Patience, patience. MechaKeys wasn't built in a day.",
    "The jackpot grows bigger over time! I guess... not a lot of time has passed, eh lad.",
    "Alright, a little progress! Sure! I wouldn't want to win such a small jackpot, though!",
  ], // 301-500

  1500: [
    "Alright, now we're talking! This jackpot's feeling pretty good!",
    "Ohhoo! That's a nifty chunk of keycaps right there! Sign me up...",
    "That's a nice jackpot! Who's gonna win it...",
    "I'll be back tomorrow to try to win it myself!",
    "That jackpot is starting to impress me!",
    "Ohhooo laddie, be sure to check back tomorrow!",
    "How high will this jackpot go!?",
  ], // 501-800

  4200: [
    "Of Gateron's Switches! Look at that jackpot!",
    "By Robo-bot's Banhammer... That jackpot is BIG!",
    "I am throughly impressed, I hope you win it!",
    "That's a hefty chunk of cap there, boyo!",
    "Ayee, this is mountin' up to be a sizeable winning.",
    "Alright, looks like I'm going to have to try to win this myself...",
    "Look's like this jackpot has finally started growing!",
  ], // 801->1200

  7000: [
    "O, lord Robo, please forgive me of my sins and LET ME WIN THAT JACKPOT!",
    "I have to say, I've become a man of God with this jackpot so high!",
    "Annnd I'm sacrificing my farm animals for the good graces of God. O great God, let me win thine jackpot.",
    "Aye, I might kill you for your winnings if you win before I do!",
    "That's a MIGHTY LARGE JACKPOT! Trust no one!",
    "Holy MAMA, that's HUGE!",
    "Aye, that be a big un!",
    "How big's my jackpot you ask? Well usually I'd consider that a personal question...",
    "Uhhh, guys? How high's this supposed to go?",
    "Who will win this one? By golly!",
    "By God, Jesus, Allah, Zeus, Santa Claus, and Magic Moonman, unite your powers and help me win this jackpot!",
    "Another day, another loser. Still no one, eh lad?",
  ], // 1201->2000

  10000: [
    "OUTRAGEOUS! HOW HAS IT GOTTEN THIS HIGH!?",
    "PLEASE GOD, PLEASE! LET ME WIN IT! PLEASE!",
    "Heh, let's check the jackp- *(spits out ale)* WHAT IN MERLIN'S BEARD!? IT'S THAT HIGH!?",
    "Hey, what, how! Make it stop going up! We're going to go out of business!",
    "Alright, can someone reset this!? It's getting TOO HIGH!",
    "Good GOD, that's more than my life savings!",
    "THINK OF HOW MANY POKEBALLS YOU CAN BUY!",
    "Checking the jackpot hmm-- HOLY CRAP! HOW'D IT GET SO HIGH!?",
  ], // 2001-4000

  18000: [
    "I'm almost over how high it is. It's too high. Who's even going to win it? What's the point. What is life, even.",
    "Yeah sure, a ton of keycaps. IF ANYONE EVER WINS IT! COME ON!",
    "The year is 2501 A.J. (after jackpot), and no one has yet won the jackpot. Cults and cities have divided into belief systems in hopes one day one of their members will win the jackpot.",
    "Ooohooo, another day, another look at that AMAZINGLY HIGH JACKPOT!",
    "Aye, let's all look at the jackpot. Isn't she beautiful.",
    "Psst, kid. Wanna trade one daily for a few pokeballs?",
    "Will SOMEONE WIN THIS THING ALREADY!?!?!?",
    "Oh COME ON now! Is this thing broken? When will someone WIN IT? PLEASE",
    "What a scam. This is RIGGED! END THIS ALREADY! IT'S BEEN SO LONG!",
    "HASI ASAS UHSDI UWHIUWHD IWD WUIHWD IHDIUWHIUWDH",
  ], // 4001 - 8000

  25000: [
    "FOR THE LOVE OF GOD SOMEONE WIN IT ALREADY!",
    "This is IMPOSSIBLE! HOW HAS NO ONE WON IT?!?",
    "Give me that daily! You all MUST be doing it wrong!",
    "Yeah, yeah. It's big, it's been a long time. I KNOW. STOP ASKING!",
    "WHY WON'T IT STOP GROWING!?!?",
    "What are even the odds of winning? ZERO?",
    "Can someone check Robo's math? When the hell will someone win it?",
    "If I win, I will literally abandon my family and buy an ISLAND!",
    "OOOHOOOO!!! WE ARE PLAYING WITH BIG MONEY NOW!",
    "Maybe we will win if we all buy keycaps! Right? I'm not superstitious, but...",
    "FINNAAAAA PEEAAAAANNNUUUUTTTTTTTTTTTTTTTTTTTTTTT",
  ],
};

const jackpot_thumbnail_map = {
  200: "jp_200.png",
  300: "jp_300.png",
  500: "jp_500.png",
  700: "jp_700.png",
  800: "jp_800.png",
  900: "jp_900.png",
  1000: "jp_1000.png",
  1100: "jp_1100.png",
  1200: "jp_1200.png",
  1300: "jp_1300.png",
  1400: "jp_1400.gif",
  1500: "jp_1500.gif",
  1600: "jp_1600.gif",
  7000: "jp_2000.gif",
  10000: "jp_2500.gif",
  15000: "jp_4000.gif",
  20000: "jp_8000.gif",
  25000: "jp_10000.gif",
};

const decide_flavor = (flavormap, x) => {
  return flavormap[
    Object.keys(flavormap).find(
      (y, i) => x <= y && x < Object.keys(flavormap)[i + 1]
    ) || Object.keys(flavormap)[Object.keys(flavormap).length - 1]
  ];
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jackpot")
    .setDescription("View the jackpot stats"),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    // This is temporary until I get the notEnoughXP function, well, functioning.
    const currentXP = await xpBot.getXP(interaction.user.id);

    const neededXP = Math.round(xpRequirement.xp - currentXP)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (!currentXP || currentXP < xpRequirement.xp) {
      let notEnoughXPEmbed = new EmbedBuilder()
        .setTitle("Not enough XP!")
        .setDescription(
          `<a:red_siren:812813923522183208> You do not have enough XP to perform this action. You need ${neededXP} more XP.`
        )
        .setColor("2f3136");

      return interaction.reply({ embeds: [notEnoughXPEmbed], ephemeral: true });
    }

    let jackpot = await discordAPI.getJackpot(interaction.user.id);
    jackpot = jackpot.data;
    let flavor = decide_flavor(jackpot_descriptor_map, jackpot.amount);
    flavor = flavor[Math.floor(Math.random() * flavor.length)];
    const thumb_choose = decide_flavor(jackpot_thumbnail_map, jackpot.amount);
    let flavor_thumb = `https://mechakeys.robolab.io/discord/media/jackpot/innkeeper/${thumb_choose}`;

    let description = `${flavor}\n\n**Amount:** \`${jackpot.amount}\` keycaps!`;
    if (jackpot.startTime) {
      description += `\n**Jackpot Started:** ${
        timeConversion(Date.now() - jackpot.startTime) + " ago"
      }`;
    }
    if (jackpot.lastWinnerID) {
      description += `\n**Last winner:** <@${jackpot.lastWinnerID}>${
        jackpot.previousAmount ? ` (${jackpot.previousAmount} keycaps!)` : ""
      }`;
    }

    let jackpotEmbed = new EmbedBuilder()
      .setTitle("Current Jackpot")
      .setDescription(description)
      .setThumbnail(
        flavor_thumb ||
          "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/259/trophy_1f3c6.png"
      )
      .setColor("e1b429")
      .setFooter({
        text: "Try to win the jackpot every day with /daily!",
        iconURL:
          "https://mechakeys.robolab.io/discord/media/daily/pepe_thonk.png",
      });

    // await interaction.reply({ embeds: [skeletonEmbed], ephemeral: true });
    await interaction.editReply({ embeds: [jackpotEmbed] });
  },
};
