const { channelMention, SlashCommandBuilder } = require('discord.js');
const { Forms } = require('@database');
const { setup } = require('./form/setup.js');
const { edit } = require('./form/edit.js');
const { erase } = require('./form/erase.js');

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
			await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true});
			return;
		}

		switch (subcommand) {
			case 'submit':
				await interaction.reply('Submit!');
				break;
			case 'setup':
				if (currentForm) {
					await interaction.reply({ content: 'This channel is already a form channel!', ephemeral: true});
				} else if (messages.size > 1) {
					await interaction.reply({ content: 'This channel already has messages! Please start from a empty channel.', ephemeral: true});
				} else {
					await setup(interaction);
				}
				break;
			case 'export':
				await interaction.reply('Export!');
				break;
			case 'erase':
				await erase(interaction, currentForm)
				break;
			case 'edit':
				await edit(interaction, currentForm);
				break;
			case 'list':
				const forms = await Forms.findAll();
				if (forms.length === 0) {
					await interaction.reply({ content: 'No forms found!', ephemeral: true});
				} else {
					const formsList = forms.map(form => `${channelMention(form.form_channel_id)} - ${form.title}`);
					await interaction.reply({ content: formsList.join('\n'), ephemeral: true});
				}
				break;
			default:
				await interaction.reply({ content: 'Not recognized!', ephemeral: true});
				break;
		}
	}
};