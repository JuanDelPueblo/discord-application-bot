export default (sequelize, DataType) => sequelize.define('applications', {
	form_channel_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	thread_id: {
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	},
	user_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	submitted: {
		type: DataType.BOOLEAN,
		allowNull: false,
	},
	submitted_at: {
		type: DataType.DATE,
		allowNull: true,
	},
	approved: {
		type: DataType.BOOLEAN,
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'applications',
	timestamps: false,
});