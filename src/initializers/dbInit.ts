import { Sequelize } from 'sequelize-typescript';
import Form from '../models/Form.model.js';
import Question from '../models/Question.model.js';
import Role from '../models/Role.model.js';
import Action from '../models/Action.model.js';
import Application from '../models/Application.model.js';
import Answer from '../models/Answer.model.js';
import path from 'path';

// initialize the database
export default (rootDir: string) => {
	return new Promise((resolve, reject) => {
		try {
			const sequelize = new Sequelize({
				host: 'localhost',
				dialect: 'sqlite',
				storage: path.join(rootDir, 'database.sqlite'),
				logging: false,
				models: [Form, Question, Role, Action, Application, Answer],
			});

			sequelize.sync()
				.then(sequelize => {
					console.log(sequelize.models)
					console.log('Database synced');
					resolve(true);
				});
		} catch (error) {
			console.error('An error occurred while initializing the database:', error);
			reject(error);
		}
	});
};
