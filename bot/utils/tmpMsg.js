function tmpMsg(channel, payload, duration = 15 * 1000, tmp = true) {
	return channel.send(
		payload,
	).then(m => {
		// eslint-disable-next-line no-shadow
		tmp && setTimeout((m) => {m.delete();}, duration, m);
	});
}

module.exports = tmpMsg;