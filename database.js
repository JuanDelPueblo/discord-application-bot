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

Forms.hasMany(Questions, { foreignKey: 'form_channel_id', as: 'questions', onDelete: 'CASCADE' });
Forms.hasMany(Actions, { foreignKey: 'form_channel_id', as: 'actions', onDelete: 'CASCADE' });
Forms.hasMany(Roles, { foreignKey: 'form_channel_id', as: 'roles', onDelete: 'CASCADE' });
Forms.hasMany(Applications, { foreignKey: 'form_channel_id', as: 'applications', onDelete: 'CASCADE' });
Applications.hasMany(Answers, { foreignKey: 'thread_id', as: 'answers', onDelete: 'CASCADE' });
Answers.belongsTo(Questions, { foreignKey: 'question_id', as: 'question' });
Questions.addHook('beforeDestroy', (question) => {
	return Answers.destroy({ where: { question_id: question.question_id } });
});

module.exports = { Forms, Actions, Roles, Questions, Applications, Answers };