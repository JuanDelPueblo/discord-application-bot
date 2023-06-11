module.exports = ( sequelize, DataTypes ) => {
	return sequelize.define( 'applications', {
		form_channel_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		form_thread_id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		user_id: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		form_answers: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		submitted_at: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	}, {
		sequelize,
		tableName: 'applications',
		timestamps: false,
	});
};

// form_answers is a JSON object that looks like this:
// {
// 	"1": "John Doe",
// 	"2": 21,
// 	"3": ["Option 1", "Option 2"],
// 	"4": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
// }