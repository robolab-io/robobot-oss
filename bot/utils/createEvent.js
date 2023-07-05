const axios = require("axios");
const hash = require("object-hash");

const { static } = require("robo-bot-utils");

const headers = { "Content-Type": "application/json" };
const event_endpoint = static.endpoints.event;
const callback_endpoint = static.endpoints.callback;

module.exports = {
  removeRole: async (guildID, userID, roleID, duration) => {
    const body = {
      endpoint: callback_endpoint,
      endpointBody: {
        guild: guildID,
        discordID: userID,
        roleID: roleID,
        action: "removeRole",
      },
      time: Date.now() + duration,
      owner: "robo-bot",
    };
    body.id = hash(body.endpointBody); // this actually WORKS HOLY SHIT
    const { data } = await axios.post(event_endpoint, body, headers);
    return data;
  },

  messageFromThePast: async (guildID, userID, channelID, message, hours) => {
    const body = {
      endpoint: callback_endpoint,
      endpointBody: {
        guildID: guildID,
        userID: userID,
        channelID: channelID,
        action: "messageFromThePast",
        message,
      },
      time: Date.now() + hours * 1000 * 60 * 60,
      owner: "robo-bot",
    };

    const { data } = await axios.post(event_endpoint, body, headers);
    return data;
  },

  // mutable = true, will overwrite existing and identical event with new time'd event.
  // message will be in object with title, text, and color, and will be used if there's no preset.
  // preset will be a code that would be interepreted by the bot at time-of-arrival.

  // example of message object
  // await createEvent.directMessageUserInFuture(msg.guild.id, msg.author.id, Date.now() + 86400000, true, {
  //   text: 'Robby test',
  //   title: 'Big title',
  //   color: 'RANDOM',
  //   footer: 'Small footie',
  //   icon: 'https://mechakeys.robolab.io/discord/media/vapor-robolab.png'
  // }, false)
  directMessageUserInFuture: async (
    guildID,
    userID,
    time,
    mutable,
    message,
    preset
  ) => {
    const body = {
      endpoint: callback_endpoint,
      endpointBody: {
        guildID: guildID,
        userID: userID,
        action: "directMessageUser",
      },
      time: time, // in Date.now() time or whatever lol
      owner: "robo-bot",
    };
    if (message) {
      body.endpointBody.message = message;
    }
    if (preset) {
      body.endpointBody.preset = preset;
    }
    // eslint-disable-next-line max-statements-per-line
    if (!message && !preset) {
      body.endpointBody.preset = "none";
      console.error("You need a message or preset...");
      return false;
    }
    if (mutable) {
      body.id = hash(body.endpointBody);
    }

    const { data } = await axios.post(event_endpoint, body, headers);
    return data;
  },

  giveaway: async (
    guildID,
    userID,
    channelID,
    time,
    winners,
    amount,
    level,
    giveawayID
  ) => {
    const body = {
      endpoint: callback_endpoint,
      endpointBody: {
        guildID: guildID,
        userID: userID,
        action: "endGiveaway",
        winners,
        amount,
        level,
        giveawayID,
        channelID,
      },
      time: time, // in Date.now() time or whatever lol
      owner: "robo-bot_giveaways",
    };

    const { data } = await axios.post(event_endpoint, body, headers);
    return data;
  },
  // what will happen?
  // user does >pray and 10% chance to create a roboEvent in 10 mins
  // do i want this mutable?
  // maybe make any event mutable based on channel and 10 minute timeslot?
  roboEventInFuture: async (
    guildID,
    channelID,
    eventType,
    time,
    eventMappingOverrides = {}
  ) => {
    // const eventMappingOverrides = {
    //   maxTime: 1000,
    //   reward: {
    //     type: 'keycap',
    //     amt: 100
    //   },
    // }

    const body = {
      endpoint: callback_endpoint,
      endpointBody: {
        guildID,
        channelID,
        action: "roboEvent",
        eventType,
        eventMappingOverrides,
      },
      time: time, // in Date.now() time or whatever lol
      owner: "robo-bot_events",
    };
    body.id = hash({
      guildID,
      channelID,
      action: "roboEvent",
      time,
    });
    // const data = {event_endpoint, body, headers}
    // console.log(JSON.stringify(data))
    const { data } = await axios.post(event_endpoint, body, headers);
    return data;
  },
};
