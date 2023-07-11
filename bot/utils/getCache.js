module.exports.getCache = (msg, client) => {
	const guild = msg.guild;
	const cache = {
		guild,
		members: guild.members.cache,
		roles: guild.roles.cache,
		emojis: guild.emojis.cache,
		channels: guild.channels.cache,

		guilds: client.guilds.cache,
		users: client.users.cache,
	};
	return cache;
};

module.exports.initCache = async (client) => {
	await client.guilds.cache.forEach(g => g.members.fetch());
	await client.guilds.cache.forEach(g => g.roles.fetch());
};
