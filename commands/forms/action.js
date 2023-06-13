const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('action')
		.setDescription('Configures the actions for the current form')
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists the actions for the current form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Add an action to take on approval or rejection')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name to identify the action with')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('when')
						.setDescription('When to take the action')
						.setRequired(true)
						.addChoices(
							{ name: 'Approved', value: 'approved' },
							{ name: 'Rejected', value: 'rejected' }
						)
				)
				.addStringOption(option =>
					option.setName('do')
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
			subcommand.setName('remove')
				.setDescription('Removes an action to take on approval or rejection')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('Name that identifies the action')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
		case 'list':
			await interaction.reply('List!');
			break;
		case 'add':
			await interaction.reply('Add!');
			break;
		case 'remove':
			await interaction.reply('Remove!');
			break;
		default:
			await interaction.reply('Not recognized!');
			break;
		}
	},
};