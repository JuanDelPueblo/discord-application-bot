module.exports = (sequelize, DataTypes) => {
	return sequelize.define('questions', {
		question_id: { // ID of the question
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		form_channel_id: { // channel ID of the form
			type: DataTypes.STRING,
			allowNull: false,
		},
		order: { // order of the question
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		title: { // title of the question
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: { // description of the question
			type: DataTypes.STRING,
			allowNull: true,
		},
		type: { // type of the question
			type: DataTypes.STRING,
			allowNull: false,
		},
		required: { // whether the question is required
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		min: { // minimum characters of text, lowest number allowed, minimum number of options, minimum number of files
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		max: { // maximum characters of text, highest number allowed, maximum number of options, maximum number of files
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		options: { // options for a select question
			type: DataTypes.JSON,
			allowNull: true,
		},
	}, {
		sequelize,
		tableName: 'questions',
		timestamps: false,
	});
};
