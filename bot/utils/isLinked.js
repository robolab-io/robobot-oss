const { devAPI } = require("robo-bot-utils");

module.exports.isLinked_username = async (username) => {
  let linked;

  try {
    const { data } = await devAPI.getUser(username);
    if (!data) return (linked = false);

    return (linked = data ? "discordLink_1" in data : false);
  } catch {
    return (linked = false);
  }
};

module.exports.isLinked_discordID = async (discordID) => {
  let linked;

  try {
    const { data } = await devAPI.getUserByDiscordID(discordID);
    if (!data) return (linked = false);

    return (linked = data ? "username" in data : false);
  } catch {
    return (linked = false);
  }
};
