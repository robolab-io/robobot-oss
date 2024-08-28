const { EmbedBuilder } = require("discord.js");
const WordPOS = require('wordpos');
const wordpos = new WordPOS();

let POS = {
  firstName: {
    prompt: 'Provide a First Name!',
    validator: (word) => {},  // capital one word
    examples: []
  },
  lastName: {
    prompt: 'Provide a Last Name!',
    validator: (word) => {}, // (de, du, da, di, von, van)? + capital x words
    examples: []
  },
  name: {
    prompt: 'Provide a Full Name!',
    validator: (word) => {},  // firstName + lastName?   alias : person
    examples: []
  },
  any: (arg)=>({
    prompt: `Provide Any ${arg}!`,
    validator: (word) => {},
    examples: [] // place, interjection, thing, action, event, game, animal, type of fluid,  article of clothing, a substance, type of ..., theme, part of the body, idiom, catchphrase, rhymes with, coordinates
  }),


  noun: (arg)=>{  // default: basic, (proper, plural, singular)
    switch(arg) {
      case  'proper': return {
        prompt: 'Provide a Proper Noun!',
        validator: (word, arg) => {},  // capitals
        examples: []
      } 
      case  'plural': return {
        prompt: 'Provide a Plural Noun!',
        validator: (word, arg) => {},  // might ends in -s/-es
        examples: []
      }
      case  'singular': return {
        prompt: 'Provide a Singular Noun!',
        validator: (word, arg) => {},  // prob doesn't doesn't end in -s/-es
        examples: []
      }
      default: return { 
        prompt: 'Provide a Noun!',
        validator: (word, arg) => {},  // 
        examples: []
      }
    }
  },
  adjective: (arg)=>{  // default: base, (ing, ed, comparative, superlative, participle)
    switch(arg) {
      case  'ing': return {
        prompt: 'Provide an "-ing" Form Adjective!',
        validator: (word, arg) => {},  // ing
        examples: []
      } 
      case  'ed': return {
        prompt: 'Provide an "-ed" Form Adjective!',
        validator: (word, arg) => {},  // ed
        examples: []
      }
      case 'comparative': return {
        prompt: 'Provide a Comparative Adjective!',
        validator: (word, arg) => {},  // er
        examples: []
      }
      case 'superlative': return {
        prompt: 'Provide a Superlative Adjective!',
        validator: (word, arg) => {},  // est
        examples: []
      }
      case 'participle': return {
        prompt: 'Provide a Participle!',
        validator: (word, arg) => {},  // est
        examples: []  // a verb used as an adjective
      }
      default: return { 
        prompt: 'Provide an Adjective!',
        validator: (word, arg) => {},  // base form
        examples: []    // /big|small|tall|short|fat|thin|round|square|long|short|big|small|tall|short|fat|thin|round|square|long/,
      }
    }
  },
  verb: (arg)=>{  // default: base, (past, present, progressive), // default: base, (ed, s, ing)
    switch(arg) {
      case 'past': return {
        prompt: 'Provide a Past-Tense Verb!',
        validator: (word, arg) => {},  // ed/ied
        examples: []
      }
      case 'present': return {
        prompt: 'Provide a Present-Tense Verb!',
        validator: (word, arg) => {},  // s
        examples: []
      }
      case 'progressive': return {
        prompt: 'Provide a progressive Verb!',
        validator: (word, arg) => {},  // ing
        examples: []
      }
      default: return {
        prompt: 'Provide a Verb!',
        validator: (word, arg) => {},  // base form
        examples: []
      }
    }
  },

  adverb: (arg) => {  // default: any adverb , (ly)
    if (arg === 'ly') return {
      prompt: 'Provide an Adverb Ending in -ly!',
      validator: (word, arg) => {},  // adverb + ly
      examples: []
    }
    else {
      return {
        prompt: 'Provide an Adverb!',
        validator: (word, arg) => {},  // any adverb
        examples: []
      }
    }
  },


  pronoun: {
    prompt: 'Provide a Pronoun!',
    validator: (word) => {},// hard code?  around 
    examples: []
  }, //(personal, possessive), //???  /he|she|it|they|we|I/

  preposition: {
    prompt: 'Provide a Preposition!',
    validator: (word) => {},// hard code?  around 
    examples: []
  },

  article: {
    prompt: 'Choose an Article!',
    validator: (word) => {}, //  /a|an|the/
    examples: []
  },
  conjunction: {
    prompt: 'Choose a Conjunction!',
    validator: (word) => {}, // /and|or/
    examples: []
  },
  determiner: {
    prompt: 'Choose a Determiner',
    validator: (word, arg) => {}, 
    examples: [] // some, all, a, an, the, these, those, this, that, these, those, this, that
  },

  number: (arg)=>{  // default: base, (ing, ed, comparative, superlative)
    if (arg==='text') {
      return {
        prompt: 'Provide a text-form Number!',
        validator: (word, arg) => {},
        examples: [] // /one|two|three|four|five|six|seven|eight|nine|ten/
      } 
    }
    if (false) {//between?  
      return {
        prompt: 'Provide a text-form Number!',
        validator: (word, arg) => {},
        examples: [] // /one|two|three|four|five|six|seven|eight|nine|ten/
      } 
    }

    const e = 2.7182818284590452353602874713527; // i hope copilot is right lul
    const pi = 3.1415926535897932384626433832795; // i hope copilot is right lul

    match = arg.match(/^[><][=]?[-]?(\d+|e|pi)$/)
    if (match) {
      return {
        prompt: `Provide an Number ${arg}!`,
        validator: (word, arg) => {},  // pass match
        examples: []
      }
    } else {
      return {
        prompt: 'Provide an Number!',
        validator: (word, arg) => {},  // normal number
        examples: []
      }
    }
  },

  year: (arg)=> {  // default: base, (past, present, progressive), // default: base, (ed, s, ing)
    switch(arg) {
      case 'YY': return {
        prompt: 'Provide a Two-Digit Year!',
        validator: (word, arg) => {},  
        examples: []
      }
      case 'YYYY': return {
        prompt: 'Provide a Four-Digit Year!',
        validator: (word, arg) => {},
        examples: []
      }
      default: return {
        prompt: 'Provide a Year!',
        validator: (word, arg) => {},  // base form
        examples: []
      }
    }
  },

  month: (arg)=> {  // default: base, (past, present, progressive), // default: base, (ed, s, ing)
    switch(arg) {
      case 'number': return {
        prompt: 'Provide a Four-Digit Year!',
        validator: (word, arg) => {},
        examples: [] //  /0|1|2|3|4|5|6|7|8|9/  /01|02|03|04|05|06|07|08|09|10|11|12/ 
      }
      default: return {
        prompt: 'Provide a Month!',
        validator: (word, arg) => {},  // base form
        examples: [] // jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec january february march april may june july august september october november december
      }
    }
  },
  day: {
    prompt: 'Provide a Day of the Month (1-31)!',
    validator: (word, arg) => {},
    examples: [] //  /0|1|2|3|4|5|6|7|8|9/  /01|02|03|04|05|06|07|08|09|10|11|12/ 
  },
  date: {
    prompt: 'Provide a Date (MM/DD/YYYY)!',
    validator: (word, arg) => {},  // default: MM/DD/YYYY,
    examples: []
  },
  weekDay: {
    prompt: 'Choose a Weekday',
    validator: (word, arg) => {},  // monday, tuesday, wednesday, thursday, friday, saturday, sunday
    examples: []
  },

  time: {
    prompt: 'Choose a Time of Day (HH:MM(:SS?) am/pm)',
    validator: (word, arg) => {},
    examples: []
  },
  duration: {
    prompt: 'Choose a Time of Day (HH:MM(:SS?))',
    validator: (word, arg) => {},
    examples: []
  }, // default: HH:MM(:SS?),
  timeUnit: {
    prompt: 'Choose a Time Unit',
    validator: (word, arg) => {}, // (milli|deca|micro|pico|mega) + seconds minutes hours 
    examples: []
  },
  
  

  currency: {
    prompt: 'Choose a Currency',
    validator: (word, arg) => {}, // /[$|¢|...]/
    examples: [] // default: $, ¢, 
  },

  mention: {
    prompt: 'Choose a Currency',
    validator: (word, arg) => {},  // <@!ID> or just @string
    examples: [] 
  },
  emoji: {
    prompt: 'Choose a Currency',
    validator: (word, arg) => {},  // <@!ID:name:>
    examples: [] 
  }
  
}

let firstResponse = true;
let responseTime = 1e4;
let voteTime = 1e4;

function getNextBlank(adlib) {
  if (adlib.currentIndex >= adlib.blankIndexes.length) {
    return false;
  }
  const index = adlib['blankIndexes'][adlib.currentIndex];
  const blankType = adlib['textArr'][index];
  if ('ref' in blankType) { // catch variables
    adlib['textArr'][index] = adlib['textArr'][blankType.ref];
    adlib.currentIndex += 1;
    return getNextBlank(adlib);
  } else {
    return blankType;
  }
}

const prompt = (interaction, blankType, i, max, adlib) => {
  let title;
  if (blankType.key in POS) {
    title = POS[blankType.key];
    if (typeof title === 'function') title = title(blankType.arg);
  } else {
    console.log('bad key:', blankType.key);
  }

  return new EmbedBuilder()
    .setColor('#800080')
    .setFooter({ 
      text: `prompt: ${i}/${max}`, 
      iconURL: 'https://images.squarespace-cdn.com/content/v1/54c45370e4b060a8975bb8f0/1590536096770-GF5P82UMMQ5WDCQRO75T/how-to-hashtags-instagram-tiktok2.jpg?format=2500w' 
    })
    .setTitle(title.prompt);
};

async function handleVote(aggregate) {
  return new Promise((resolve, reject) => {
    let mostVoted = {id:'', count: 0, content: ''};
    setTimeout(() => {
      for(let m of aggregate) {
        let count = 0;
        try { 
          count = m[1].reactions.cache.get('✅').count;
        } catch(e) { 
          console.log('MadLib Vote: message was deleted...');
        }
        if (count > mostVoted.count) {
          mostVoted = {id: m[1].id, count, content: m[1].content, author: m[1].author.id};
        }
      }
      resolve([mostVoted.content, mostVoted.author]);
    }, voteTime, aggregate);
  });
}

function endGame(interaction, adlib, currentGames) {
  interaction.channel.send('game over');
  interaction.channel.send('> ' + adlib.textArr.join(' **'));
  firstResponse = true;
  currentGames[interaction.channel.id].adlib = false; //end game
}

const adlibHandler = async (interaction, adlib, currentGames, next = false) => {
  if (next) {
    if (adlib.currentIndex === adlib.blankIndexes.length) {
      endGame(interaction, adlib, currentGames);
      return false;
    }

    blankType = getNextBlank(adlib);
    if (blankType === false) {
      endGame(interaction, adlib, currentGames);
      return false;
    }
    await interaction.channel.send({ embeds: [prompt(interaction, blankType, adlib['currentIndex'] + 1, adlib['blankIndexes'].length, adlib)] });
    firstResponse = true;
    adlib.currentIndex += 1;
    return adlib;
  }

  if (firstResponse) {
    firstResponse = false;
    const filter = () => true;
    const collected = await interaction.channel.awaitMessages({ filter, time: responseTime, max: 1 });

    const blankIndex = adlib['currentIndex'] - 1;
    const textIndex = adlib.blankIndexes[blankIndex];

    if (collected.size === 0) {
      try {
        await interaction.channel.messages.fetch(interaction.id);
      } catch(e) {
        await interaction.channel.send('message deleted? try again...');
        firstResponse = true;
        return;
      }

      if (adlib.lastUser === interaction.user.id) {
        await interaction.channel.send('Unless voted for, no back to back responses. sorry!');
        firstResponse = true;
        return;
      } else {
        adlib.textArr[textIndex] = collected.first().content;
        adlib.lastUser = interaction.user.id;
      }
    } else {
      await interaction.channel.send('VOTE! VOTE!! VOTE!!!');
      let aggregate = [[interaction.id, interaction], ...collected];
      for(let [i, m] of aggregate.entries()) {
        try {
          if(BigInt(m[0]) >= BigInt(interaction.id)) await m[1].react('✅');
        } catch(e) {
          aggregate.splice(i, 1);
          console.log('MadLib React: message was deleted...');
        }
      }
      let [winningMsg, user] = await handleVote(aggregate);
      if (winningMsg === '') {
        firstResponse = true;
        await interaction.channel.send('submissions reset, try again!');
        return;
      }
      adlib.textArr[textIndex] = winningMsg;
      adlib.lastUser = user;
    }

    return adlibHandler(interaction, adlib, currentGames, true);
  }

  return adlib;
};

module.exports = madlibHandler;