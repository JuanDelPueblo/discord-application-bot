import { Sequelize, DataTypes } from 'sequelize';
import FormsDef from './models/forms.js';
import ActionsDef from './models/actions.js';
import RolesDef from './models/roles.js';
import QuestionsDef from './models/questions.js';
import ApplicationsDef from './models/applications.js';
import AnswersDef from './models/answers.js';

const sequelize = new Sequelize({
	host: 'localhost',
	dialect: 'sqlite',
	storage: 'database.sqlite',
	logging: false,
});

const Forms = FormsDef(sequelize, DataTypes);
const Actions = ActionsDef(sequelize, DataTypes);
const Roles = RolesDef(sequelize, DataTypes);
const Questions = QuestionsDef(sequelize, DataTypes);
const Applications = ApplicationsDef(sequelize, DataTypes);
const Answers = AnswersDef(sequelize, DataTypes);

Forms.hasMany(Questions, { foreignKey: 'form_channel_id', as: 'questions', onDelete: 'CASCADE' });
Forms.hasMany(Actions, { foreignKey: 'form_channel_id', as: 'actions', onDelete: 'CASCADE' });
Forms.hasMany(Roles, { foreignKey: 'form_channel_id', as: 'roles', onDelete: 'CASCADE' });
Forms.hasMany(Applications, { foreignKey: 'form_channel_id', as: 'applications', onDelete: 'CASCADE' });
Applications.hasMany(Answers, { foreignKey: 'thread_id', as: 'answers', onDelete: 'CASCADE' });
Answers.belongsTo(Questions, { foreignKey: 'question_id', as: 'question' });
Questions.addHook('beforeDestroy', (question) => {
	return Answers.destroy({ where: { question_id: question.question_id } });
});

export { Forms, Actions, Roles, Questions, Applications, Answers };