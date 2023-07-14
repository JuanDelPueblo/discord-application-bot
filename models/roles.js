module.exports = (sequelize, DataTypes) => {
	return sequelize.define('roles', {
		form_channel_id: { // channel ID of the form
			type: DataTypes.STRING,
			allowNull: false,
		},
		role_id: { // role ID to give permission to
			type: DataTypes.JSON,
			allowNull: false,
		},
		permission: { // permission to give to the role
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 'none',
		},
	}, {
		sequelize,
		tableName: 'roles',
		timestamps: false,
	});
};