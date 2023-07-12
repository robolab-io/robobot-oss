const { isLinked_discordID } = require('../utils/isLinked');
const { Role_Linked } = require('../ids')

module.exports = async (member) => {
	if (await isLinked_discordID(member.id)) {
		member.roles.add(Role_Linked)
	}
}
