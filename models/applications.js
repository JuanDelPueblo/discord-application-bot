module.exports = (sequelize, DataTypes) => {
	return sequelize.define('applications', {
		form_channel_id: { // channel ID of the form, the identifier of each form
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
		submitted: { // whether the application has submitted his form
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		submitted_at: { // date the application was submitted
			type: DataTypes.DATE,
			allowNull: true,
		},
		approved: { // whether the application was approved or rejected
			type: DataTypes.BOOLEAN,
			allowNull: true,
		},
	}, {
		sequelize,
		tableName: 'applications',
		timestamps: false,
	});
};