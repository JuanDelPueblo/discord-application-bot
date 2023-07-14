const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadCommands(rootDir) {
	return new Promise((resolve, reject) => {
		try {
			const commands = [];
			const foldersPath = path.resolve(rootDir, 'commands');
			fs.promises.readdir(foldersPath)
				.then((folders) => {
					const commandFolders = folders.filter((folder) => {
						const folderPath = path.resolve(foldersPath, folder);
						return fs.lstatSync(folderPath).isDirectory();
					});

					for (const folder of commandFolders) {
						const commandsPath = path.resolve(foldersPath, folder);
						fs.promises.readdir(commandsPath)
							.then((files) => {
								for (const file of files) {
									if (file.endsWith('.js')) {
										const filePath = path.resolve(commandsPath, file);
										const command = require(filePath);

										if (command.data && command.execute) {
											commands.push(command.data.toJSON());
										} else {
											console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
										}
									}
								}
								resolve(commands);
							});
					}
				});
		} catch (error) {
			reject(error);
		}
	});
}

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
