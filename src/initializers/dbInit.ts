import { Sequelize, DataTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

// load models from subfolders and register them
async function registerModels(sequelize, rootDir: string) {
	const modelsPath = path.resolve(rootDir, 'models');
	const files = await fs.promises.readdir(modelsPath);

	for (const file of files) {
		if (file.endsWith('.js') || file.endsWith('.ts')) {
			const filePath = path.resolve(modelsPath, file);
			const modelModule = await import(filePath);
			const modelFunction = modelModule.default || modelModule; // Handle default exports if available
			modelFunction(sequelize, DataTypes);
		}
	}

	return true;
}


// initialize the database
export default (rootDir: string) => {
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
					resolve(true);
				});
		} catch (error) {
			console.error('An error occurred while initializing the database:', error);
			reject(error);
		}
	});
};
