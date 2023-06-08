const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('form')
		.setDescription('Form commands')
		.addSubcommand(subcommand =>
			subcommand.setName('submit')
				.setDescription('Enable or disable new applications submissions'))
				.addBooleanOption(option =>
					option.setName('state')
						.setDescription('The state to set')
						.setRequired(true))
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
			subcommand.setName('question')
				.setDescription('Question commands')
				.addSubcommand(subcommand =>
					subcommand.setName('get')
						.setDescription('Get all questions'))
				.addSubcommand(subcommand =>
					subcommand.setName('edit')
						.setDescription('Edit a question')
						.addIntegerOption(option =>
							option.setName('id')
								.setDescription('The question id')
								.setRequired(true))))
		.addSubcommand(subcommand =>
			subcommand.setName('prompt')
				.setDescription('Prompt commands')
				.addSubcommand(subcommand =>
					subcommand.setName('edit')
						.setDescription('Edit a prompt'))),
	async execute(interaction) {
		await interaction.reply('form!');
	}
};