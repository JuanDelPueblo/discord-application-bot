import { ChannelType, SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { Forms } from '../database.js';
import listCommand from './action/list.js';
import addCommand from './action/add.js';
import removeCommand from './action/remove.js';

export const data = new SlashCommandBuilder()
	.setName('action')
	.setDescription('Configures the actions for the current form')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.addSubcommand(subcommand => subcommand.setName('list')
		.setDescription('Lists the actions for the current form'),
	)
	.addSubcommandGroup(subcommandGroup => subcommandGroup.setName('add')
		.setDescription('Add an action to take on approval or rejection')
		.addSubcommand(subcommand => subcommand.setName('addrole')
			.setDescription('Add a role to the user')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addRoleOption(option => option.setName('role')
				.setDescription('The role to add')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('removerole')
			.setDescription('Remove a role from the user')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addRoleOption(option => option.setName('role')
				.setDescription('The role to remove')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('ban')
			.setDescription('Ban the user')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addStringOption(option => option.setName('reason')
				.setDescription('The reason for the ban')
				.setRequired(false),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('kick')
			.setDescription('Kick the user')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addStringOption(option => option.setName('reason')
				.setDescription('The reason for the kick')
				.setRequired(false),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('sendmessage')
			.setDescription('Send a message to a channel')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addChannelOption(option => option.setName('channel')
				.setDescription('The channel to send the message to')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
			)
			.addStringOption(option => option.setName('message')
				.setDescription('The message to send (use {user} to mention the user)')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('sendmessagedm')
			.setDescription('Send a message to the user')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			)
			.addStringOption(option => option.setName('message')
				.setDescription('The message to send')
				.setRequired(true),
			),
		)
		.addSubcommand(subcommand => subcommand.setName('delete')
			.setDescription('Delete the application')
			.addStringOption(option => option.setName('name')
				.setDescription('Name to identify the action with')
				.setRequired(true),
			)
			.addStringOption(option => option.setName('when')
				.setDescription('When to take the action')
				.setRequired(true)
				.addChoices(
					{ name: 'Approved', value: 'approved' },
					{ name: 'Rejected', value: 'rejected' },
				),
			),
		),
	)
	.addSubcommand(subcommand => subcommand.setName('remove')
		.setDescription('Removes an action to take on approval or rejection')
		.addStringOption(option => option.setName('name')
			.setDescription('Name that identifies the action')
			.setRequired(true)
			.setAutocomplete(true),
		),
	);
export async function autocomplete(interaction: AutocompleteInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		return await interaction.respond([]);
	}

	if (subcommand === 'remove') {
		// autocomplete action names
		const actions = await currentForm.getActions();
		const focusedValue = interaction.options.getFocused();
		const filtered = actions.filter((action: any) => action.name.startsWith(focusedValue)).slice(0, 25);
		await interaction.respond(
			filtered.map((action: any) => ({ name: action.name, value: action.name })),
		);
	}
}
export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel!.id } });

	if (!currentForm) {
		await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true });
		return;
	}

	switch (subcommand) {
	case 'list': {
		await listCommand(interaction, currentForm);
		break;
	}
	case 'addrole':
	case 'removerole':
	case 'ban':
	case 'kick':
	case 'sendmessage':
	case 'sendmessagedm':
	case 'delete': {
		await addCommand(interaction, currentForm, subcommand);
		break;
	}
	case 'remove': {
		await removeCommand(interaction, currentForm);
		break;
	}
	default: {
		await interaction.reply('Not recognized!');
		break;
	}
	}
}

export default {
	data,
	autocomplete,
	execute,
};