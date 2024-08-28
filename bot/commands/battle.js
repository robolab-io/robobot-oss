const { MessageEmbed } = require("discord.js");
const xpRequirement = { xp:2000, level:10 }
const xpBot = require('./../utils/xpBot')
const axios = require('axios')
const env = process.env.env || 'staging' // production or staging
const developerAPI = env === 'production' ? 'https://api.mechakeys.robolab.io/' : 'https://api-dev.mechakeys.robolab.io/'
const discordAPI = env === 'production' ? 'https://discord-api.robolab.io/prod/' : 'https://discord-api.robolab.io/dev/'
const idKey = require('../utils/idKey')
const commandLimiter = require('./../utils/commandLimiter')
module.exports.battle = async (msg, { args, client, getMember }) => {
  // check xp requirement
  if (commandLimiter(msg)) return
  return msg.channel.send('Battles are coming soon! Catch and level up some pokemon in the meantime!')  

  // Battles
  // A battle is initated by doing >battle @user
  // We will have two users, @1 and @2

  // HEALTH
  // Every Pokemon will have a base health stat of 20 HP
  // Each level will add +8 HP to their total.
  // A level 30 user will have 240 health
  // A level 20 user will have 160 health
  // A level 10 user will have 80 health
  // Health will be capped at 300

  // ATTACK
  // The attack stat is determined by the base "power" of a TM
  // Every 5 levels, the move will do +5 damage on top of it.
  // For attacks that are weak against a type, the power will be cut in half.
  // For attacks that are strong against a type, the power will be doubled!
  // Attacks will always be capped at 200 power.

  // When the battle starts, @1 will choose a Pokemon to fight with.
  // @2 will choose afterwards

  // BATTLE PROCESS
  // The bot will @mention the first user (chosen randomly between @1 and @2) 
  // In the @mention, there will be a list of moves that the user can make their Pokemon use.

  // EXAMPLE
  // @1 - (1) TM03 - WATER PULSE || (2) TMSOMETHING - TAIL WAG || (3) TMWHATEVER - BUBBLE GUN
  // @1 will have 15 seconds to choose a move before the bot defaults to choosing (1)
  // When the user sends the move number, the bot will calculate the attack power.
  // @1 
  // 1

  // Now let's assume move 1 does 20 base damage.

  // @Robo-bot
  // @1's Level 20 Water Pokemon does 20 + ((20 / 5) * 5) * strong_against ? "2" : "0.5" damage.
  // That is 20 + 20 * 2 = 80 damage on @2's current Fire Pokemon.

  // The bot will deduct 80 from @2's current Pokemon's health value.

  // LOSE
  // If health < or = zero, the Pokemon is dead and cannot be used, and @2 will be prompted to choose another Pokemon.
  // If @2's other options of Pokemon = zero, then @1 won the battle
  // @1 will gain XP: 20 + (average of @2's Pokemon levels) + 1/2 (@2's Discord level)

  // POKEMON STILL ALIVE
  // @2 will choose a move and attack @1's Pokemon.

  // This will continue until all Pokemon of a user are dead.

  // ITEMS
  // We will have to persist this command like a minigame.
  // If current battle & user is in a battle & user has pokemon that are alive, then let the user use a potion

  // COMMANDS
  // >battle, initiates battle
  // >item [item] [argument], uses an item if there is a battle occuring
  // EX: >item potion @pokemon
  // >health [argument], returns the current health of a Pokemon during battle.
}
