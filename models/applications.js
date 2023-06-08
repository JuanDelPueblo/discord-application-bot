module.exports = ( sequelize, DataTypes ) => {
	return sequelize.define( 'applications', {
		form_channel_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		form_thread_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		form_answers: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		submitted_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	}, {
		sequelize,
		tableName: 'applications',
		timestamps: false,
	});
};