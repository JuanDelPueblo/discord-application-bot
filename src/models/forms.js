export default (sequelize, DataType) => sequelize.define('forms', {
	form_channel_id: {
		type: DataType.STRING,
		primaryKey: true,
	},
	title: {
		type: DataType.STRING,
		allowNull: false,
	},
	description: {
		type: DataType.STRING,
		allowNull: true,
	},
	button_text: {
		type: DataType.STRING,
		allowNull: false,
	},
	embed_message_id: {
		type: DataType.STRING,
		allowNull: true,
	},
	enabled: {
		type: DataType.BOOLEAN,
		allowNull: false,
		defaultValue: false,
	},
	max: {
		type: DataType.INTEGER,
		allowNull: true,
	},
}, {
	sequelize,
	tableName: 'forms',
	timestamps: false,
});