const { isLinked_discordID } = require('../utils/isLinked');

module.exports = async (member) => {
	if (await isLinked_discordID(member.id)) {
		member.roles.add('766073171135692830')
	}
}
