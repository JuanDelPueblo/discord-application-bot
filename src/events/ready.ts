import { Client, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;
export function execute(client: Client) {
	for (const guild of client.guilds.cache.values()) {
		guild.members.fetch();
	}
	console.log(`Ready! Logged in as ${client.user!.tag}`);
}