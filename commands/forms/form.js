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
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('setup')
				.setDescription('Begins the process of creating a new form'))
		.addSubcommand(subcommand =>
			subcommand.setName('export')
				.setDescription('Exports all applications in the current form in a .csv file'))
		.addSubcommand(subcommand =>
			subcommand.setName('erase')
				.setDescription('Erases all applications in the current form'))
		.addSubcommand(subcommand =>
			subcommand.setName('editquestions')
				.setDescription('Edit a question in the application form')
				.addIntegerOption(option =>
					option.setName('id')
						.setDescription('The question id')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('showquestions')
				.setDescription('Show all questions in the application form'))
		.addSubcommand(subcommand =>
			subcommand.setName('editprompt')
				.setDescription('Edit the application prompt')),
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
		case 'editquestions':
			await interaction.reply('Edit Questions!');
			break;
		case 'showquestions':
			await interaction.reply('Show Questions!');
			break;
		case 'editprompt':
			await interaction.reply('Edit Prompt!');
			break;
		default:
			await interaction.reply('Not recognized!');
			break;
		}
	}
};