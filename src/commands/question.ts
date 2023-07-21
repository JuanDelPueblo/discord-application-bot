import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import Form from '../models/Form.model.js';
import editCommand from './questions/edit.js';
import addCommand from './questions/add.js';
import removeCommand from './questions/remove.js';
import listCommand from './questions/list.js';
import moveCommand from './questions/move.js';

export const data = new SlashCommandBuilder()
	.setName('question')
	.setDescription('Question commands')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('edit')
		.setDescription('Edit a question in the application form')
		.addIntegerOption(option => option.setName('id')
			.setDescription('The question id')
			.setRequired(true)
			.setAutocomplete(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Lists all questions in the application form'),
	)
	.addSubcommandGroup(subcommandGroup => subcommandGroup.setName('add')
		.setDescription('Add a question to the application form')
		.addSubcommand(subcommand => subcommand.setName('text')
			.setDescription('Add a text question to the application form')
			.addBooleanOption(option => option.setName('required')
				.setDescription('Is the question required (default: false)')
				.setRequired(false),
			)
			.addIntegerOption(option => option.setName('min')
				.setDescription('Minimum amount of characters (default: 1)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(2000),
			)
			.addIntegerOption(option => option.setName('max')
				.setDescription('Maximum amount of characters (default: 2000)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(2000),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('number')
			.setDescription('Add a number question to the application form')
			.addBooleanOption(option => option.setName('required')
				.setDescription('Is the question required (default: false)')
				.setRequired(false),
			)
			.addIntegerOption(option => option.setName('min')
				.setDescription('Minimum number (default: No limit)')
				.setRequired(false),
			)
			.addIntegerOption(option => option.setName('max')
				.setDescription('Maximum number (default: No limit)')
				.setRequired(false),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('select')
			.setDescription('Add a select question to the application form')
			.addBooleanOption(option => option.setName('required')
				.setDescription('Is the question required (default: false)')
				.setRequired(false),
			)
			.addIntegerOption(option => option.setName('min')
				.setDescription('Minimum amount of options (default: 1)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(25),
			)
			.addIntegerOption(option => option.setName('max')
				.setDescription('Maximum amount of options (default: 25)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(25),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('fileupload')
			.setDescription('Add a file upload question to the application form')
			.addBooleanOption(option => option.setName('required')
				.setDescription('Is the question required (default: false)')
				.setRequired(false),
			)
			.addIntegerOption(option => option.setName('min')
				.setDescription('Minimum amount of files (default: 1)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(10),
			)
			.addIntegerOption(option => option.setName('max')
				.setDescription('Maximum amount of files (default: 10)')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(10),
			),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('remove')
		.setDescription('Remove a question from the application form')
		.addIntegerOption(option => option.setName('id')
			.setDescription('The question id')
			.setRequired(true)
			.setAutocomplete(true),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('move')
		.setDescription('Move a question in the application form')
		.addIntegerOption(option => option.setName('id')
			.setDescription('The question id')
			.setRequired(true),
		)
		.addIntegerOption(option => option.setName('position')
			.setDescription('The position to move the question to')
			.setRequired(true),
		),
	);
export async function autocomplete(interaction: AutocompleteInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		return await interaction.respond([]);
	} else if (subcommand === 'remove' || subcommand === 'edit') {
		// autocomplete question ID for remove and edit subcommands
		const questions = await currentForm.$get('question');
		const focusedValue = interaction.options.getFocused();
		const filtered = questions.filter((question) => {
			const questionId = question.question_id;
			return String(questionId).startsWith(focusedValue);
		}).slice(0, 25);
		await interaction.respond(
			filtered.map((question) => ({ name: question.title, value: question.question_id })),
		);
	}
}
export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Form.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true });
		return;
	}

	switch (subcommand) {
	case 'edit': {
		await editCommand(interaction, currentForm);
		break;
	}
	case 'list': {
		await listCommand(interaction, currentForm);
		break;
	}
	case 'text':
	case 'number':
	case 'select':
	case 'fileupload': {
		await addCommand(interaction, currentForm, subcommand);
		break;
	}
	case 'remove': {
		await removeCommand(interaction, currentForm);
		break;
	}
	case 'move': {
		await moveCommand(interaction, currentForm);
		break;
	}
	default: {
		await interaction.reply('Unknown subcommand');
		break;
	}
	}
}

export default {
	data,
	autocomplete,
	execute,
};