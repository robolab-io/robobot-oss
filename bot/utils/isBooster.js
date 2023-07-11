module.exports = (guild, userID) => {
	const user = guild.members.cache.get(userID)
	const getDonateRole = user.roles.cache.get('745750711584948316')
	const getManualBoostRole = user.roles.cache.get('812464225548369951')
	return !!getDonateRole || !!getManualBoostRole
}
