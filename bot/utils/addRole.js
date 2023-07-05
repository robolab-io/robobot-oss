/* over engineered shenanigans, ignore */
function getGuild(obj, gid = false) {
	const name = obj.constructor.name;

	if (name === 'Guild') return obj;
	if (['Role', 'Message', 'GuildMember'].includes(name)) return obj.guild;

	if (name === 'Client') {
		if (!gid) {
			return console.log('no guild id provided');
		}
		return obj.guilds.cache.get(gid);
	}
	try {
		return obj.guild;
	}
	catch (err) {
		return console.log('given obj did not contain guild');
	}
}

function getRole(guild, role) {
	switch (role.constructor.name) {
	case 'Role':
		return role;
	case 'String': // role is ID
		return guild.roles.cache.get(role);
	}
}

function getMember(guild, member) {
	switch (member.constructor.name) {
	case 'GuildMember':
		return member;
	case 'User':
		return guild.members.cache.get(member.id);
	case 'String': // member is ID
		return guild.members.cache.get(member);
	}
}

module.exports = (member, role, ...args) => {
	/*
   [GuildMember, Role]
   [string, string, guild]
   [string, string, client, id]
  */
	var guild;
	if (member.constructor === String && role.constructor === String) {
		if (args.length === 0) {
			return console.log('at least one discord object must be provided');
		}
		guild = getGuild(...args); // guild or client, guildId
	}

	if (member.constructor.name === 'GuildMember' && role.constructor.name === 'Role') {
		return member.addRole(role);
	}
	else if (member.constructor.name === 'GuildMember') {
		guild = getGuild(member);
	}
	else if (role.constructor.name === 'Role') {
		guild = getGuild(role);
	}

	return getMember(guild, member).addRole(getRole(guild, member));
};
