const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// load commands from subfolders into an array
function loadCommands(rootDir) {
	return new Promise((resolve, reject) => {
		try {
			const commands = [];
			const commandPath = path.join(rootDir, 'commands');
			const commandFiles = fs.readFileSync(commandPath).filter(file => file.endsWith('.js'));

			for (const file of commandFiles) {
				const filePath = path.join(commandPath, file);
				const command = require(filePath);
				if (command.data && command.execute) {
					commands.push(command.data.toJSON());
				} else {
					console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
				}
			}
			resolve(commands);
		} catch (error) {
			reject(error);
		}
	});
}

// reload the commands on Discord
module.exports = (rootDir, clientId, token) => {
	return new Promise((resolve, reject) => {
		try {
			loadCommands(rootDir)
				.then((commands) => {
					const rest = new REST().setToken(token);

					console.log(`Started refreshing ${commands.length} application (/) commands.`);

					return rest.put(Routes.applicationCommands(clientId), { body: commands });
				})
				.then(data => {
					console.log(`Successfully reloaded ${data.length} application (/) commands.`);
					resolve(data);
				});

		} catch (error) {
			console.error('An error occurred while initializing the commands:', error);
			reject(error);
		}
	});
};
