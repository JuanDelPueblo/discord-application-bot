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
Forms.hasMany(Applications, { foreignKey: 'form_channel_id', as: 'applications' });

// Get applications for a specific form thread ID.
Reflect.defineProperty(Applications.prototype, 'get', {
	value: function (form_thread_id) {
		return Applications.findOne({
			where: {
				form_thread_id,
			},
			include: 'form',
		});

	}
});

// Get all applications for a specific form channel ID.
Reflect.defineProperty(Applications.prototype, 'getAll', {
	value: function (form_channel_id) {
		return Applications.findAll({
			where: {
				form_channel_id,
			},
			include: 'form',
		});
	}
});

// Create a new form.
Reflect.defineProperty(Forms.prototype, 'create', {
	value: function (form_channel_id, form_role, form_questions, action_data, enabled) {
		return Forms.create({
			form_channel_id,
			form_role, 
			form_questions, 
			action_data,
			enabled,
		});
	}
});

// Delete an application for a specific user, form channel ID, and form thread ID.
Reflect.defineProperty(Applications.prototype, 'delete', {
	value: function (form_thread_id) {
		return Applications.destroy({
			where: {
				form_thread_id,
			},
		});
	}
});

// Delete a form and all applications for a specific form channel ID.
Reflect.defineProperty(Forms.prototype, 'deleteAll', {
	value: async function (form_channel_id) {
		await Applications.destroy({
			where: {
				form_channel_id,
			},
		});
		return Forms.destroy({
			where: {
				form_channel_id,
			},
		});
	}
});

module.exports = { Forms, Applications };