const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		for (const guild of client.guilds.cache.values()) {
			guild.members.fetch();
		}
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};