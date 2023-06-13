const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Configures which roles can view, act on, or edit a form')
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all roles with permissions to view, act on, or edit a form')
				)
		.addSubcommand(subcommand =>
			subcommand.setName('set')
				.setDescription('Set a role to view, act on, or edit a form')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to set permissions for')
						.setRequired(true)
				)
				.addBooleanOption(option =>
					option.setName('view')
						.setDescription('Whether the role can view forms')
						.setRequired(false)
				)
				.addBooleanOption(option =>
					option.setName('action')
						.setDescription('Whether the role can act on forms')
						.setRequired(false)
				)
				.addBooleanOption(option =>
					option.setName('edit')
						.setDescription('Whether the role can edit forms')
						.setRequired(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Removes a role and all their permissions')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to remove all permissions for')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
		case 'list':
			await interaction.reply('List!');
			break;
		case 'set':
			await interaction.reply('Set!');
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