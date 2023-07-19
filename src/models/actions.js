export default (sequelize, DataType) => sequelize.define('actions', {
	form_channel_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	name: {
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	},
	when: {
		type: DataType.STRING,
		allowNull: false,
	},
	do: {
		type: DataType.STRING,
		allowNull: false,
	},
	role_id: {
		type: DataType.STRING,
		allowNull: true,
	},
	message_channel_id: {
		type: DataType.STRING,
		allowNull: true,
	},
	message: {
		type: DataType.STRING,
		allowNull: true,
	},
	reason: {
		type: DataType.STRING,
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'actions',
	timestamps: false,
});