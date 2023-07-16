const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

// load models from subfolders and register them
function registerModels(sequelize, rootDir) {
	return new Promise((resolve, reject) => {
		try {
			const modelsPath = path.resolve(rootDir, 'models');
			fs.promises.readdir(modelsPath)
				.then((files) => {
					for (const file of files) {
						if (file.endsWith('.js')) {
							const filePath = path.resolve(modelsPath, file);
							const model = require(filePath);
							model(sequelize, DataTypes);
						}
					}
				})
				.then(() => resolve());
		} catch (error) {
			reject(error);
		}
	});
}

// initialize the database
module.exports = (rootDir) => {
	return new Promise((resolve, reject) => {
		try {
			const sequelize = new Sequelize({
				host: 'localhost',
				dialect: 'sqlite',
				storage: path.join(rootDir, 'database.sqlite'),
				logging: false,
			});

			registerModels(sequelize, rootDir)
				.then(() => {
					return sequelize.sync();
				}).then(() => {
					console.log('Database synced');
					sequelize.close();
					resolve();
				});
		} catch (error) {
			console.error('An error occurred while initializing the database:', error);
			reject(error);
		}
	});
};
