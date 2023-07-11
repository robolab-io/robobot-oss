function tmpMsg(channel, payload, duration = 15 * 1000, tmp = true) {
	return channel.send(
		payload,
	).then(m => {
		tmp && setTimeout((m) => {m.delete();}, duration, m)
	})
}

module.exports = tmpMsg