const Sequelize = require('sequelize');

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	storage: 'database.sqlite',
	logging: false,
});

const Forms = require('./models/forms.js')(sequelize, Sequelize.DataTypes);
const Actions = require('./models/actions.js')(sequelize, Sequelize.DataTypes);
const Roles = require('./models/roles.js')(sequelize, Sequelize.DataTypes);
const Questions = require('./models/questions.js')(sequelize, Sequelize.DataTypes);
const Applications = require('./models/applications.js')(sequelize, Sequelize.DataTypes);
const Answers = require('./models/answers.js')(sequelize, Sequelize.DataTypes);

Forms.hasMany(Questions, { foreignKey: 'form_channel_id', as: 'questions' });
Forms.hasMany(Actions, { foreignKey: 'form_channel_id', as: 'actions' });
Forms.hasMany(Roles, { foreignKey: 'form_channel_id', as: 'roles' });
Forms.hasMany(Applications, { foreignKey: 'form_channel_id', as: 'applications' });
Applications.hasMany(Answers, { foreignKey: 'thread_id', as: 'answers' });
Answers.belongsTo(Questions, { foreignKey: 'question_id', as: 'question' });

// // Get applications for a specific form thread ID.
// Reflect.defineProperty(Applications.prototype, 'get', {
// 	value: function (form_thread_id) {
// 		return Applications.findOne({
// 			where: {
// 				form_thread_id,
// 			},
// 			include: 'form',
// 		});

// 	}
// });

// // Get all applications for a specific form channel ID.
// Reflect.defineProperty(Applications.prototype, 'getAll', {
// 	value: function (form_channel_id) {
// 		return Applications.findAll({
// 			where: {
// 				form_channel_id,
// 			},
// 			include: 'form',
// 		});
// 	}
// });

// // Create a new form.
// Reflect.defineProperty(Forms.prototype, 'create', {
// 	value: function (form_channel_id, form_role, form_questions, action_data, enabled) {
// 		return Forms.create({
// 			form_channel_id,
// 			form_role, 
// 			form_questions, 
// 			action_data,
// 			enabled,
// 		});
// 	}
// });

// // Delete an application for a specific user, form channel ID, and form thread ID.
// Reflect.defineProperty(Applications.prototype, 'delete', {
// 	value: function (form_thread_id) {
// 		return Applications.destroy({
// 			where: {
// 				form_thread_id,
// 			},
// 		});
// 	}
// });

// // Delete a form and all applications for a specific form channel ID.
// Reflect.defineProperty(Forms.prototype, 'deleteAll', {
// 	value: async function (form_channel_id) {
// 		await Applications.destroy({
// 			where: {
// 				form_channel_id,
// 			},
// 		});
// 		return Forms.destroy({
// 			where: {
// 				form_channel_id,
// 			},
// 		});
// 	}
// });

module.exports = { Forms, Actions, Roles, Questions, Applications, Answers };