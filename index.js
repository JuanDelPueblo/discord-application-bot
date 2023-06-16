require('module-alias/register')
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const configInit = require('./initializers/configInit.js');

function main() {
	const { token } = require('@config');

	const client = new Client({ intents: [GatewayIntentBits.Guilds] });

	client.commands = new Collection();
	client.cooldowns = new Collection();
	const foldersPath = path.join(__dirname, 'commands');
	let commandFolders = fs.readdirSync(foldersPath);

	commandFolders = commandFolders.filter((folder) => {
        const folderPath = path.resolve(foldersPath, folder);
        return fs.lstatSync(folderPath).isDirectory();
    });

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}

	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	client.login(token);
}

configInit(path.resolve(__dirname)).then(configSuccess => {
	if (configSuccess) {
		console.log('Config initialized');
		main()
	}
}).catch(error => {
	console.error('An error occurred while initializing the config:', error);
});