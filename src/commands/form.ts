import { channelMention, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Forms } from '../database.js';
import setupCommand from './form/setup.js';
import editCommand from './form/edit.js';
import eraseCommand from './form/erase.js';
import submitCommand from './form/submit.js';
import exportCommand from './form/export.js';
import setMaxCommand from './form/setmax.js';

export const data = new SlashCommandBuilder()
	.setName('form')
	.setDescription('Form commands')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('submit')
		.setDescription('Enable or disable new applications submissions')
		.addBooleanOption(option => option.setName('state')
			.setDescription('The state to set')
			.setRequired(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('setup')
		.setDescription('Begins the process of creating a new form'),
	)
	.addSubcommand(subcommand => subcommand.setName('export')
		.setDescription('Exports all applications in the current form in a .csv file'),
	)
	.addSubcommand(subcommand => subcommand.setName('erase')
		.setDescription('Erases all applications in the current form'),
	)
	.addSubcommand(subcommand => subcommand.setName('edit')
		.setDescription('Edit the application prompt'),
	)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Lists all forms and their respective channels'),
	)
	.addSubcommand(subcommand => subcommand.setName('setmax')
		.setDescription('Sets the maximum number of applications per applicant')
		.addIntegerOption(option => option.setName('max')
			.setDescription('Max number of applications per applicant (default: No limit)')
			.setMinValue(1),
		),
	);
export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = await interaction.options.getSubcommand();
	const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel!.id } });

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
			const formsList = forms.map((form: any) => `${channelMention(form.form_channel_id)} - ${form.title}`);
			await interaction.reply({ content: formsList.join('\n'), ephemeral: true });
		}
		break;
	}
	case 'setmax': {
		await setMaxCommand(interaction, currentForm);
		break;
	}
	default: {
		await interaction.reply({ content: 'Not recognized!', ephemeral: true });
		break;
	}
	}
}

export default {
	data,
	execute,
};