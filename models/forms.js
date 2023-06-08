module.exports = (sequelize, DataTypes) => {
	return sequelize.define('forms', {
		form_channel_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		form_questions: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		action_data: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		enabled: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	}, {
		sequelize,
		tableName: 'forms',
		timestamps: false,
	});
};