module.exports = (sequelize, DataTypes) => {
	return sequelize.define('forms', {
		form_channel_id: { // channel ID of the form, the identifier of each form
			type: DataTypes.STRING,
			primaryKey: true,
		},
		title: { // title of the form
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: { // description of the form
			type: DataTypes.STRING,
			allowNull: true,
		},
		button_text: { // text of the button to open the form
			type: DataTypes.STRING,
			allowNull: false,
		},
		embed_message_id: { // message ID of the form embed
			type: DataTypes.STRING,
			allowNull: true,
		},
		enabled: { // whether the form is open for submissions
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