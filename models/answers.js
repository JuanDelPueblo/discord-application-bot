module.exports = (sequelize, DataTypes) => {
	return sequelize.define('answers', {
		thread_id: { // thread ID of the application, the identifier of each application
			type: DataTypes.STRING,
			allowNull: false,
		},
		question_id: { // ID of the question
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		answer: { // answer to the question
			type: DataTypes.JSON,
			allowNull: false,
		},
	}, {
		sequelize,
		tableName: 'answers',
		timestamps: false,
	});
};