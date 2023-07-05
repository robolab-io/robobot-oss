const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
	const onlineEmb = new EmbedBuilder()
		.setTitle('Robo-bot Online!')
		.setTimestamp()
		.setFooter({ text: 'Mode: rewrite_dev' })
		.setColor('2f3136');

	try {
		const botDev = client.channels.cache.get('751665008869376010');
		botDev.send({ embeds: [onlineEmb] });
		const guild = client.guilds.cache.get('462274708499595264');

	}
	catch (e) {
		console.log(e);
	}
};