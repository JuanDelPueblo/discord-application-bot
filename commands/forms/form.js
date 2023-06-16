const { ActionRowBuilder, channelMention, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const { Forms } = require('@database');
const { setup } = require('./form/setup.js');
const { edit } = require('./form/edit.js');

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
		const subcommand = await interaction.options.getSubcommand();
		const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel.id } });
		const messages = await interaction.channel.messages.fetch();

		if (!currentForm && !['list', 'setup'].includes(subcommand)) {
			await interaction.reply('This channel is not a form channel!');
			return;
		}

		switch (subcommand) {
			case 'submit':
				await interaction.reply('Submit!');
				break;
			case 'setup':
				if (currentForm) {
					await interaction.reply('This channel is already a form channel!');
				} else if (messages.size > 1) {
					await interaction.reply('This channel already has messages! Please start from a empty channel.');
				} else {
					await setup(interaction);
				}
				break;
			case 'export':
				await interaction.reply('Export!');
				break;
			case 'erase':
				await interaction.reply('Erase!');
				break;
			case 'edit':
				await edit(interaction, currentForm);
				break;
			case 'list':
				const forms = await Forms.findAll();
				const formsList = forms.map(form => `${channelMention(form.form_channel_id)} - ${form.title}`);
				await interaction.reply(formsList.join('\n'));
				break;
			default:
				await interaction.reply('Not recognized!');
				break;
		}
	}
};