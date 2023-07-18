const { channelMention, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Forms } = require('@database');
const { setupCommand } = require('./form/setup.js');
const { editCommand } = require('./form/edit.js');
const { eraseCommand } = require('./form/erase.js');
const { submitCommand } = require('./form/submit.js');
const { exportCommand } = require('./form/export.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('form')
		.setDescription('Form commands')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand.setName('submit')
				.setDescription('Enable or disable new applications submissions')
				.addBooleanOption(option =>
					option.setName('state')
						.setDescription('The state to set')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('setup')
				.setDescription('Begins the process of creating a new form'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('export')
				.setDescription('Exports all applications in the current form in a .csv file'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('erase')
				.setDescription('Erases all applications in the current form'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('Edit the application prompt'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all forms and their respective channels'),
		),
	async execute(interaction) {
		const subcommand = await interaction.options.getSubcommand();
		const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel.id } });

		if (!currentForm && !['list', 'setup'].includes(subcommand)) {
			await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true });
			return;
		}

		switch (subcommand) {
		case 'submit': {
			await submitCommand(interaction, currentForm);
			break;
		}
		case 'setup': {
			if (currentForm) {
				await interaction.reply({ content: 'This channel is already a form channel!', ephemeral: true });
			} else {
				await setupCommand(interaction);
			}
			break;
		}
		case 'export': {
			await exportCommand(interaction, currentForm);
			break;
		}
		case 'erase': {
			await eraseCommand(interaction, currentForm);
			break;
		}
		case 'edit': {
			await editCommand(interaction, currentForm);
			break;
		}
		case 'list': {
			const forms = await Forms.findAll();
			if (forms.length === 0) {
				await interaction.reply({ content: 'No forms found!', ephemeral: true });
			} else {
				const formsList = forms.map(form => `${channelMention(form.form_channel_id)} - ${form.title}`);
				await interaction.reply({ content: formsList.join('\n'), ephemeral: true });
			}
			break;
		}
		default: {
			await interaction.reply({ content: 'Not recognized!', ephemeral: true });
			break;
		}
		}
	},
};