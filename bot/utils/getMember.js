module.exports = (content, members = false) => {
	if (!content) return undefined;

	const mentionMatch = content.match(/<(@!|@)(\d+)>/);
	const idMatch = content.match(/^(\d+)$/);
	var id;
	if (idMatch) {
		id = idMatch[1];
	}
	else if (mentionMatch) {
		id = mentionMatch[2];
	}
	else {
		return false;
	}

	return members ? members.get(id) : id;
};