const fs = require('fs');
const path = require('path');

module.exports = (rootDir) => {
	return new Promise((resolve, reject) => {
		const configFilePath = path.join(rootDir, 'config.json');

		try {
			if (!fs.existsSync(configFilePath)) { // generate config file if it doesn't exist
				const initialConfig = {
					token: 'your-token-here',
					clientId: 'your-client-id-here',
					color: '#0099ff',
					DO_NOT_EDIT: 'THE FOLLOWING VALUES ARE AUTO-GENERATED. DO NOT EDIT THEM UNLESS YOU KNOW WHAT YOU ARE DOING.',
					commandsDeployed: false,
					databaseDeployed: false,
				};

				fs.promises.writeFile(configFilePath, JSON.stringify(initialConfig, null, 4))
					.then(() => {
						console.log('[INFO] config.json has been created. Please edit it with your bot\'s token and client ID.');
						resolve(false);
					})
					.catch(reject);
			} else { // check if the database and commands have been deployed, and deploy them if not
				const config = require(configFilePath);

				if (!config.databaseDeployed) {
					require('./dbInit.js')(rootDir)
						.then(() => {
							config.databaseDeployed = true;
							return fs.promises.writeFile(configFilePath, JSON.stringify(config, null, 4));
						})
						.catch(reject);
				}

				if (!config.commandsDeployed) {
					require('./commandsInit.js')(rootDir, config.clientId, config.token)
						.then(() => {
							config.commandsDeployed = true;
							return fs.promises.writeFile(configFilePath, JSON.stringify(config, null, 4));
						})
						.then(resolve(true))
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
