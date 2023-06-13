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
		can_view: { // whether the role can view the form
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		can_take_action: { // whether the role can approve or deny applications
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		can_edit: { // whether the role can edit the form
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	}, {
		sequelize,
		tableName: 'roles',
		timestamps: false,
	});
};