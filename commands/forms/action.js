const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('action')
		.setDescription('Configures the actions for the current form')
		.addSubcommand(subcommand =>
			subcommand.setName('set')
				.setDescription('Set an action to take on approval or denial')
				.addStringOption(option =>
					option.setName('type')
						.setDescription('Approve or Deny action')
						.setRequired(true)
						.addChoices(
							{ name: 'Approve', value: 'approve' },
							{ name: 'Deny', value: 'deny' }
						))
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name to identify the action with')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('action')
						.setDescription('The action to take')
						.setRequired(true)
						.addChoices(
							{ name: 'Add Role', value: 'addrole' },
							{ name: 'Remove Role', value: 'removerole' },
							{ name: 'Ban', value: 'ban' },
							{ name: 'Kick', value: 'kick' },
							{ name: 'Send message to channel', value: 'sendmessage' },
							{ name: 'Send message to user in DM', value: 'sendmessagedm' },
							{ name: 'Archive application', value: 'archive' },
							{ name: 'Delete application', value: 'delete' }
						)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('unset')
				.setDescription('Unsets an action to take on approval or denial')
				.addStringOption(option =>
					option.setName('type')
						.setDescription('Approve or Deny action')
						.setRequired(true)
						.addChoices(
							{ name: 'Approve', value: 'approve' },
							{ name: 'Deny', value: 'deny' }
						))
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name that identifies the action')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		await interaction.reply('Action!');
	},
};