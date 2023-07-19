export default (sequelize, DataType) => sequelize.define('roles', {
	form_channel_id: {
		type: DataType.STRING,
		allowNull: false,
	},
	role_id: {
		type: DataType.JSON,
		allowNull: false,
	},
	permission: {
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: 'none',
	},
}, {
	sequelize,
	tableName: 'roles',
	timestamps: false,
});