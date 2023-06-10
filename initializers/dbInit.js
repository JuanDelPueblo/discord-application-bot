const Sequelize = require('sequelize');
const { DataTypes } = require('sequelize');
const path = require('path');

function registerModels(sequelize, rootDir) {
  return new Promise(async (resolve, reject) => {
    try {
      for (const file of await require('fs').promises.readdir(path.join(rootDir, 'models'))) {
        if (file.endsWith('.js')) {
          require(path.join(rootDir, 'models', file))(sequelize, DataTypes);
        }
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = (rootDir) => {
  return new Promise(async (resolve, reject) => {
    try {
      const sequelize = new Sequelize({
        host: 'localhost',
        dialect: 'sqlite',
        storage: path.join(rootDir, 'database.sqlite'),
        logging: false,
      });

      await registerModels(sequelize, rootDir);

      await sequelize.sync();

      console.log('Database synced');
      sequelize.close();

      resolve();
    } catch (error) {
      console.error('An error occurred while initializing the database:', error);
      reject(error);
    }
  });
};
