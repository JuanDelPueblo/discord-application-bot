const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadCommands(rootDir) {
  return new Promise(async (resolve, reject) => {
    try {
      const commands = [];
      const foldersPath = path.resolve(rootDir, 'commands');
      let commandFolders = await fs.promises.readdir(foldersPath);

      commandFolders = commandFolders.filter((folder) => {
        const folderPath = path.resolve(foldersPath, folder);
        return fs.lstatSync(folderPath).isDirectory();
      });

      for (const folder of commandFolders) {
        const commandsPath = path.resolve(foldersPath, folder);
        const commandFiles = await fs.promises.readdir(commandsPath);

        for (const file of commandFiles) {
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
      }

      resolve(commands);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = (rootDir, clientId, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const commands = await loadCommands(rootDir);
      const rest = new REST().setToken(token);

      console.log(`Started refreshing ${commands.length} application (/) commands.`);

      const data = await rest.put(Routes.applicationCommands(clientId), { body: commands });

      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
      resolve(data);
    } catch (error) {
      console.error('An error occurred while initializing the commands:', error);
      reject(error);
    }
  });
};
