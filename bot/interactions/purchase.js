const { EmbedBuilder } = require("discord.js")
const { devAPI, discordAPI } = require("robo-bot-utils")

const store_prices = {
  pokeball: 10,
  bodyguards: 25,
  "glowing pencil": 15,
  "fist of doom": 200,
  bitchslap: 10,
  "flying fist": 50,
  "boost device": 25,
  "gold relic": 20,

  duckbill: 100,
  swaggymoment: 100,
  spinklepurpo: 100,
  thunkapurpo: 100,
  spicymeme: 200,
  binkoblue: 100,
  fortnitebad: 100,
  nibbleblue: 100,
  novelkeycream: 100,
  vaporwave: 200,
  axiosgreen: 100,
  deathknight: 5000,
  greenbois: 200,
  electrobois: 200,
  alwaysred: 500,
  aesthetic: 200,
  finnapepe: 200,
  tumbleyellow: 100,
  statisticallyblue: 500
}

let storeResData = {
  /**  Quantity Items  **/
  item_pokeball: {
    store_name: 'pokeball',
    quant_name: 'a Pokeball',
    amountKey: 'pokeballCount',
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}>, You bought a Pokeball for \`${store_prices["pokeball"]} keycaps\`! You now have \`${amount} pokeballs\`.`
  },

  item_glowingpencil: {
    store_name: 'glowing pencil',
    quant_name: 'a Glowing Pencil',
    amountKey: 'glowingPencilCount',
    successfulPurchaseEmbedDescription: (id, amount) =>  `<@${id}>, You bought a Glowing Pencil for \`${store_prices["glowing pencil"]} keycaps\`! You now have \`${amount} glowing pencils\`.`
  },

  item_boostdevice: {
    store_name: 'boost device',
    quant_name: 'a Boost Device',
    amountKey: 'boostDeviceCount',
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}>, You bought a Boost Device for \`${store_prices["boost device"]} keycaps\`! You now have \`${amount} boost devices \`.`
  },

  item_goldrelic: {
    store_name: 'gold relic',
    quant_name: 'a Gold Relic',
    amountKey: 'goldRelicCount',
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}>, You bought a Gold Relic for \`${store_prices["gold relic"]} keycaps\`! You now have \`${amount} gold relics\`.`
  },

  item_bitchslap: {
    store_name: 'bitchslap',
    quant_name: 'a Bitch Slap',
    amountKey: 'bitchslapCount',
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}>, You bought a Bitch Slap for \`${store_prices['bitchslap']} keycaps\`! You now have \`${amount} bitch slaps\`.`
  },

  /**  Role Items  **/
  item_bodyguards: {
    store_name: 'bodyguards',
    quant_name: 'Bodyguards',
    role: '811255216128786503',
    dupeReject: id =>  `<a:red_siren:812813923522183208> <@${id}> You already have bodyguards! Dumbass. Now fuck off`,
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}> You bought Bodyguards for \`${store_prices["bodyguards"]} keycaps\`! Remember, if you /fight, you lose them and will have to re-buy!`,
  },

  item_fistofdoom: {
    store_name: 'fist of doom',
    quant_name: 'a Fist of Doom',
    role: '865711992785731614',
    dupeReject: id => `<a:red_siren:812813923522183208> <@${id}> You have a Fist of Doom already! Now go superfight someone, dumbass.`,
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}> You bought the Fist of Doom for \`${store_prices["fist of doom"]} keycaps\`! Now go superfight someone!`
  },

  item_flyingfist: {
    store_name: 'flying fist',
    quant_name: 'the Flying Fist',
    role: '939774831220633600',
    dupeReject: id => `<a:red_siren:812813923522183208> <@${id}> You already have a Flying Fist! Dumbass. Save a tumbleweed or something`,
    successfulPurchaseEmbedDescription: (id, amount) => `<@${id}> You bought the Flying Fist for \`${store_prices["flying fist"]} keycaps\`! Go save those tumbleweeds!`
  }
}

let fn = async (interaction, obj) => {
  // If role purchase, reject if user already has role
  if (obj?.role && interaction.member.roles.cache.get(obj?.role)) {
    return interaction.reply( obj.dupeReject(interaction.user.id) )
  }

  // Make purchase
  const deductKeycapRes = await devAPI.deductKeycaps( interaction.user.id,
    { amount: `${store_prices[obj.store_name]}` }
  )
  if ( deductKeycapRes && deductKeycapRes.success ) {

    let amount;
    if (obj?.role) {
      // If role purchased, add to user
      interaction.member.roles.add("811255216128786503");
    } 
    else { // or if(obj?.amountKey){}
      // If quantity purchased, send increment to db
      let incr_owned_res = await discordAPI.incrementField(interaction.user.id, { field: obj.amountKey })
      if (!incr_owned_res.success) return interaction.reply(
        `<@${interaction.user.id}>, something went wrong when buying ${obj.quant_name}!`
      )
      amount = incr_owned_res.data.Attributes[obj.amountKey]
    }
    
    // Response Embed
    let successfulPurchaseEmbed = new EmbedBuilder()
      .setTitle(`You bought ${obj.quant_name}!`)
      .setDescription(`${obj.successfulPurchaseEmbedDescription(interaction.user.id, amount)}`)
      .setColor("2f3136")

    return interaction.reply({ embeds: [successfulPurchaseEmbed] })
  }
  
  else {
    return interaction.reply(
      `<a:red_siren:812813923522183208> You don't have \`${store_prices[obj.store_name]} keycaps\`! ${obj?.role ? 'Now scram!' : 'Yikes...'}`
    );
  }
}


module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return

    if (interaction.customId === "itemSelect") {
      try {
        let userWantsToBuyItem = interaction.values[0];

        return await fn(interaction, storeResData[userWantsToBuyItem])
       
        client.channels.cache
          .get("945055759824207962")
          .send(
            `**[Author]**: ${interaction.user.username} \`(${interaction.user.id})\` executed interaction \`${interaction.commandName}\` \n**[Channel]**: ${interaction.channel} \`(${interaction.channel.id})\` \n**[Interaction ID]**: \`${interaction.id}\``
          );
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command. Please try again later.",
          ephemeral: true,
        });
      }
    }
  })
}