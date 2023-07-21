import { REST, Routes, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// load commands from subfolders into an array
async function loadCommands(rootDir: string) {
	const commands: Object[] = [];
	const commandPath = path.join(rootDir, 'src/commands');
	const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));

	for (const file of commandFiles) {
		const filePath = path.resolve(commandPath, file);
		const command = await import(pathToFileURL(filePath).toString());
		if (command.data && command.execute) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
	return commands;
}

// reload the commands on Discord
export default (rootDir: string, clientId: string, token: string) => {
	return new Promise((resolve, reject) => {
		try {
			loadCommands(rootDir)
				.then((commands) => {
					const rest = new REST().setToken(token);

					console.log(`Started refreshing ${commands.length} application (/) commands.`);

					return rest.put(Routes.applicationCommands(clientId), { body: commands }) as Promise<RESTPostAPIChatInputApplicationCommandsJSONBody[]>;
				})
				.then((data) => {
					console.log(`Successfully reloaded ${data.length} application (/) commands.`);
					resolve(true);
				});

		} catch (error) {
			console.error('An error occurred while initializing the commands:', error);
			reject(error);
		}
	});
};
