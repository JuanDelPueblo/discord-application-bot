import { existsSync, readFileSync, promises } from 'fs';
import { join } from 'path';
import dbInit from './dbInit.js';
import commandsInit from './commandsInit.js';

export default (rootDir) => {
	return new Promise((resolve, reject) => {
		const configFilePath = join(rootDir, 'config.json');

		try {
			if (!existsSync(configFilePath)) { // generate config file if it doesn't exist
				const initialConfig = {
					token: 'your-token-here',
					clientId: 'your-client-id-here',
					color: '#0099ff',
					DO_NOT_EDIT: 'THE FOLLOWING VALUES ARE AUTO-GENERATED. DO NOT EDIT THEM UNLESS YOU KNOW WHAT YOU ARE DOING.',
					commandsDeployed: false,
					databaseDeployed: false,
				};

				promises.writeFile(configFilePath, JSON.stringify(initialConfig, null, 4))
					.then(() => {
						console.log('[INFO] config.json has been created. Please edit it with your bot\'s token and client ID.');
						resolve(false);
					})
					.catch(reject);
			} else { // check if the database and commands have been deployed, and deploy them if not
				const configFile = readFileSync(configFilePath, 'utf8');
				const config = JSON.parse(configFile);

				if (!config.databaseDeployed) {
					dbInit(rootDir)
						.then(() => {
							config.databaseDeployed = true;
							return promises.writeFile(configFilePath, JSON.stringify(config, null, 4));
						})
						.catch(reject);
				}

				if (!config.commandsDeployed) {
					commandsInit(rootDir, config.clientId, config.token)
						.then(() => {
							config.commandsDeployed = true;
							return promises.writeFile(configFilePath, JSON.stringify(config, null, 4));
						})
						.then(() => resolve(true))
						.catch(reject);
				} else {
					resolve(true);
				}
			}
		} catch (error) {
			console.error('An error occurred while initializing the config:', error);
			reject(error);
		}
	});
};
