export default (sequelize, DataType) => sequelize.define('answers', {
	thread_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	question_id: {
		type: DataType.INTEGER,
		allowNull: false,
	},
	answer: {
		type: DataType.JSON,
		allowNull: false,
	},
}, {
	sequelize,
	tableName: 'answers',
	timestamps: false,
});