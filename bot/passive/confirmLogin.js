const { EmbedBuilder } = require('discord.js')

const { SERVER_ID, dev_bot } = require('../ids')

module.exports = async (client) => {
	const onlineEmb = new EmbedBuilder()
		.setTitle('Robo-bot Online!')
		.setTimestamp()
		.setFooter({ text: 'Mode: rewrite_dev' })
		.setColor('2f3136')

	try {
		const botDev = client.channels.cache.get(dev_bot)
		botDev.send({ embeds: [onlineEmb] })
		const guild = client.guilds.cache.get(SERVER_ID)
	}
	catch (e) {
		console.log(e)
	}
}