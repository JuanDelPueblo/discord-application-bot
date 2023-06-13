module.exports = (sequelize, DataTypes) => {
	return sequelize.define('actions', {
		form_channel_id: { // channel ID of the form
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: { // name of the action
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		when: { // 'approved' or 'rejected'
			type: DataTypes.STRING,
			allowNull: false,
		},
		do: { // choices in /commands/form/action.js
			type: DataTypes.STRING,
			allowNull: false,
		},
		role_id: { // for role actions
			type: DataTypes.STRING,
			allowNull: true,
		},
		message_channel_id: { // channel to send message to if enabled
			type: DataTypes.STRING,
			allowNull: true,
		},
		message: { // message to send if enabled
			type: DataTypes.STRING,
			allowNull: true,
		},
		reason: { // reason to send for a kick or ban if enabled
			type: DataTypes.STRING,
			allowNull: true,
		},

	}, {
		sequelize,
		tableName: 'actions',
		timestamps: false,
	});
}