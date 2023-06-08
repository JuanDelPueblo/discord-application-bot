const Sequelize = require('sequelize');
const { prototype } = require('ws');

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	storage: 'database.sqlite',
	logging: false,
});

// Contains the form channel ID, the questions, the actions to take on approval or denial, and whether the form is enabled or not.
const Forms = require('./models/forms.js')(sequelize, Sequelize.DataTypes);
// Contains	the form channel ID, the thread ID, the user ID, the answers to the questions, and the time the form was submitted.
const Applications = require('./models/applications.js')(sequelize, Sequelize.DataTypes);

Applications.belongsTo(Forms, { foreignKey: 'form_channel_id', as: 'form' });

// Get applications for a specific user and form channel ID.
Reflect.defineProperty(Applications.prototype, 'get', {
	value: async function (user_id, form_channel_id) {
		const form = await Applications.findOne({
			where: {
				user_id,
				form_channel_id,
			},
			include: 'form',
		});
		return form;
	}
});

// Get all applications for a specific form channel ID.
Reflect.defineProperty(Applications.prototype, 'getAll', {
	value:	async function (form_channel_id) {
		const forms = await Applications.findAll({
			where: {
				form_channel_id,
			},
			include: 'form',
		});
		return forms;
	}
});

// Create a new form.
Reflect.defineProperty(Forms.prototype, 'create', {
	value: async function (user_id, form_channel_id, form_data, submitted_at) {
		const form = await Forms.create({
			form_channel_id,
			form_questions,
			action_data,
		});
		return form;
	}
});

// Delete an application for a specific user and form channel ID.
Reflect.defineProperty(Applications.prototype, 'delete', {
	value: async function (user_id, form_channel_id) {
		const form = await Applications.destroy({
			where: {
				user_id,
				form_channel_id,
			},
		});
		return form;
	}
});

// Delete a form and all applications for a specific form channel ID.
Reflect.defineProperty(Forms.prototype, 'deleteAll', {
	value: async function (form_channel_id) {
		const forms = await Forms.destroy({
			where: {
				form_channel_id,
			},
		});
		const applications = await Applications.destroy({
			where: {
				form_channel_id,
			},
		});
		return forms;
	}
});

module.exports = { Forms, Applications };