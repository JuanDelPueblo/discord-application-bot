const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('form')
		.setDescription('Form commands')
		.addSubcommand(subcommand =>
			subcommand.setName('submit')
				.setDescription('Enable or disable new applications submissions')
				.addBooleanOption(option =>
					option.setName('state')
						.setDescription('The state to set')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('setup')
				.setDescription('Begins the process of creating a new form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('export')
				.setDescription('Exports all applications in the current form in a .csv file')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('erase')
				.setDescription('Erases all applications in the current form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('Edit the application prompt')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all forms and their respective channels')
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
		case 'submit':
			await interaction.reply('Submit!');
			break;
		case 'setup':
			await interaction.reply('Setup!');
			break;
		case 'export':
			await interaction.reply('Export!');
			break;
		case 'erase':
			await interaction.reply('Erase!');
			break;
		case 'edit':
			await interaction.reply('Edit!');
			break;
		case 'list':
			await interaction.reply('List!');
			break;
		default:
			await interaction.reply('Not recognized!');
			break;
		}
	}
};