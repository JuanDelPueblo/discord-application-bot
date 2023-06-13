module.exports = ( sequelize, DataTypes ) => {
	return sequelize.define('applications', {
		channel_id: { // channel ID of the form, the identifier of each form
			type: DataTypes.STRING,
			allowNull: false,
		},
		thread_id: { // thread ID of the application, the identifier of each application
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		user_id: { // user ID of the applicant
			type: DataTypes.STRING,
			allowNull: false,
		},
		finished: { // whether the application was finished
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		approved: { // whether the application was approved
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		submitted_at: { // date the application was submitted
			type: DataTypes.DATE,
			allowNull: false,
		},
	}, {
		sequelize,
		tableName: 'applications',
		timestamps: false,
	});
};