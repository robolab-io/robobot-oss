const { Role_Donator, Status_Boost } = require('../ids')

module.exports = (guild, userID) => {
	const user = guild.members.cache.get(userID)
	const getDonateRole = user.roles.cache.get(Role_Donator)
	const getManualBoostRole = user.roles.cache.get(Status_Boost)
	return !!getDonateRole || !!getManualBoostRole
}
