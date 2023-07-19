export default (sequelize, DataType) => sequelize.define('questions', {
	question_id: {
		type: DataType.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	form_channel_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	order: {
		type: DataType.INTEGER,
		allowNull: false,
	},
	title: {
		type: DataType.STRING,
		allowNull: false,
	},
	description: {
		type: DataType.STRING,
		allowNull: true,
	},
	type: {
		type: DataType.STRING,
		allowNull: false,
	},
	required: {
		type: DataType.BOOLEAN,
		allowNull: false,
	},
	min: {
		type: DataType.INTEGER,
		allowNull: true,
	},
	max: {
		type: DataType.INTEGER,
		allowNull: true,
	},
	options: {
		type: DataType.JSON,
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'questions',
	timestamps: false,
});
