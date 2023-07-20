import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Client, GatewayIntentBits } from 'discord.js';
import { fileURLToPath, pathToFileURL } from 'url';
import configInit from './initializers/configInit.js';

export function loadConfig() {
	const configFile = readFileSync(join(parentDirectory, 'config.json'), 'utf8');
	return JSON.parse(configFile);
}

async function registerEvents(client: Client) {
	const eventsPath = join(parentDirectory, 'src/events');
	try {
		const eventFiles = readdirSync(eventsPath);
		for (const file of eventFiles) {
			if (file.endsWith('.js') || file.endsWith('.ts')) {
				const filePath = join(eventsPath, file);
				const event = await import(pathToFileURL(filePath).toString());
				if (event.once) {
					client.once(event.name, (...args) => event.execute(...args));
				} else {
					client.on(event.name, (...args) => event.execute(...args));
				}
			}
		}
	} catch (err) {
		console.error('Error registering events:', err);
	}
}

function main() {
	const config = loadConfig();

	const client = new Client({ intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessageReactions,
	] });

	registerEvents(client).then(() => client.login(config.token));
}

// initialize the config and then start the bot
const currentFilePath = fileURLToPath(import.meta.url);
const parentDirectory = join(currentFilePath, '..', '..');

configInit(parentDirectory).then(configSuccess => {
	if (configSuccess) {
		console.log('Config initialized');
		main();
	}
}).catch(error => {
	console.error('An error occurred while initializing the config:', error);
});