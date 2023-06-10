const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Configures which roles can view, approve, or deny forms')
		.addSubcommand(subcommand =>
			subcommand.setName('set')
				.setDescription('Set a role to view, approve, or deny forms')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to set permissions for')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('type')
						.setDescription('Mod or Admin')
						.setRequired(true)
						.addChoices(
							{ name: 'Mod (view-only)', value: 'mod' },
							{ name: 'Admin (can approve and deny)', value: 'admin' }
						))
		)
		.addSubcommand(subcommand =>
			subcommand.setName('unset')
				.setDescription('Unsets a role to view, approve, or deny forms')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to unset permissions for')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		await interaction.reply('Action!');
	},
};