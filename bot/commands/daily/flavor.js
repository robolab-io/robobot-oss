const gifs = {
  keycaps: [
    "https://mechakeys.robolab.io/discord/media/daily/daily_keycap_1.gif",
  ],
  xp: ["https://mechakeys.robolab.io/discord/media/daily/daily_xp_1.gif"],
};

const jackpot_descriptor_map = {
  200: "small", // 0-200
  1000: "medium", // 101-500
  5000: "large", // 501-2000
  10000: "huge", // 2001->Infinity
};


const jackpot_flavor_text = {
  small: [
    "Awesome! That was quick!",
    "GG EZ",
    "gg game",
    "Wow, kinda small jackpot but congrats",
    "Everyone's jealous!",
    "Buy yourself something nice.",
    "Man ngl i'm a lil jealous",
    "Nice maybe buy an avatar or some shit",
  ],
  medium: [
    "Awww yeah, the jackpot! You deserve it.",
    "Wow! Look at that jackpot!",
    "We all knew you'd win it.",
    "Now that's diligence.",
    "Cha-ching, nice boii",
    "Go tell your mom!",
    "Shiiit you finally won something!",
    "Looks like you're not a loser after all.",
    "Take it all you greedy bastard",
  ],
  large: [
    "Holy shit! That's a LOT of keycaps!",
    "INTRODUCING: The Jeff Bezos of keycaps",
    "Jesus CHROIST! Everyone bow down...",
    "WOW, that's a SHITLOAD!!! MARRY ME",
    "DAAYUUMM SONNN DADDY GONBE PROUD BOI",
  ],
  huge: [
    "WHAT THE FUCK HOW WHAT, AYO WHAT",
    "JESUS CHRIST THAT'S FUCKLOAD",
    "GOD, FINALLY JESUS CHRIST",
    "🥵🥵🥵💦 u got me wet bruh",
    "YOOOO WHAT THE FUCK",
    "MAJOR STONKS, YOU CAN BUY ALL OF ROBOLAB NOW!!!",
    "FUCKKKK YES KID WE GONNA GET LAID TONIGHT",
    "AAAAAAAAAAAAAHHHHHHHHHHHHHHHHHHHHHHHH!!!!!!",
  ],
};

const generateDailyAfterMessage = () => {
  const dailyAfterMessage = [
    "Did you know you can `/pray` to get keycaps and XP? Try it out!",
    "Check the `/jackpot` every day! You might be the lucky winner when you claim a daily!",
    "Did you know that daily rewards INCREASE when you level up more? Check your `/xp` often!",
    "You can boost this server to earn TWICE the rewards in Discord!",
    "Try starting a conversation! You might meet someone new!",
    "Did you know that you can check your MechaKeys keystrokes in Discord? Try `/profile`",
    "Did you know that you can check your MechaKeys leaderboard rank in Discord? Try `/rank`",
    "Come back tomorrow for more rewards!",
    "Here's a pro-tip, talking more increases how much XP you earn! Check out the bar next to the channel name!",
    "You can buy keycaps in MechaKeys and earn TWICE the rewards in Discord!",
    "Did you know that 2x rewards also apply to the jackpot? Get to boosting and buying, quickly!",
    "The higher your level, the more rewards you get. Try starting a conversation!",
    "Say hi to someone when they claim their daily!",
    "Dailies aren't the only way to get XP and keycaps, try talking to someone new!",
    "Try asking a staff member to start a minigame!",
    "You unlock new commands as you level up!",
    "Discord levels unlock new achievements in MechaKeys!",
    "Getting first place on the Weekly Leaderboard gives you 1000 keycaps!",
  ];

  return dailyAfterMessage[
    Math.floor(Math.random() * dailyAfterMessage.length)
  ];
};


const decide_flavor = (flavormap, x) => {
  return jackpot_descriptor_map[
    Object.keys(flavormap).find(
      (y, i) => x <= y && x < Object.keys(flavormap)[i + 1]
    ) || Object.keys(flavormap)[Object.keys(flavormap).length - 1]
  ];
};

module.exports = {
  gifs,
  jackpot_descriptor_map,
  jackpot_flavor_text,
  generateDailyAfterMessage,
  decide_flavor
}