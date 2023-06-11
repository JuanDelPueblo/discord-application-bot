module.exports = (sequelize, DataTypes) => {
	return sequelize.define('forms', {
		form_channel_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		form_role: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		form_questions: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		approve_actions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		reject_actions: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		enabled: {
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

// form_role is a JSON object that looks like this:
// {
// 		"admin_roles": [
// 			"someroleid",
// 			"anotherroleid"
// 		],
// 		"mod_roles": [
// 			"someroleid",
// 			"anotherroleid"
// 		]
// }

// form_questions is a JSON object that looks like this:
// {
// 	"1": {
// 		"question": "What is your name?",
// 		"type": "text",
// 		"required": true,
// 		"minLength": 1,
// 		"maxLength": 100,
// 	},
// 	"2": {
// 		"question": "What is your age?",
// 		"type": "number",
// 		"required": true,
// 		"minNum": 1,
// 		"maxNum": 100,
// 	},
// 	"3": {
// 		"question": "Select one or more of these options",
// 		"type": "select",
// 		"required": true,
// 		"minOptions": 1,
// 		"maxOptions": 3,
// 		"options": [
// 			"Option 1",
// 			"Option 2",
// 			"Option 3"
// 		],
// 	},
// 	"4": {
// 		"question": "Upload a file",
// 		"type": "file",
// 		"required": true,
// 		"minFiles": 1,
// 		"maxFiles": 3,
// 		"maxFileSize": 1000000,
// 		"allowedFileTypes": [
// 			"png",
// 			"jpg",
// 			"jpeg",
// 			"gif"
// 		],
// 	},
// }

// approve_actions and deny_actions are JSON objects that look like this:
// {
// 	"add_user_role": {
// 		"action": "add_role",
// 		"role_id": "roleid",
// 	},
// 	"remove_user_role": {
// 		"action": "remove_role",
// 		"role_id": "roleid",
// 	},
// 	"send_message_to_channel": {
// 		"action": "send_message",
// 		"channel_id": "channelid",
// 		"message": "Your application has been approved!",
// 	},
// 	"send_dm_to_user": {
// 		"action": "send_dm",
// 		"message": "Your application has been approved!",
// 	},
// 	"ban_user": {
// 		"action": "ban_user",
// 		"reason": "Your application has been denied.",
// 	},
// 	"kick_user": {
// 		"action": "kick_user",
// 		"reason": "Your application has been denied. Try again later.",
// 	},
// 	"delete_application": {
// 		"action": "delete_application",
// 	},
// }


