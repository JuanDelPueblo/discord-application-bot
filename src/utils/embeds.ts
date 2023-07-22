import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ThreadChannel, roleMention } from 'discord.js';
import { loadConfig } from '../index.js';
import Form from '../models/Form.model.js';
import Question from '../models/Question.model.js';
import Role from '../models/Role.model.js';

export function formEmbed(interaction: BaseInteraction, formData: Form) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(formData.title);

	if (formData.description) embed.setDescription(formData.description);

	const formButton = new ButtonBuilder()
		.setCustomId(`form-${interaction.channel!.id}`)
		.setLabel(formData.button_text || 'New Application')
		.setStyle(ButtonStyle.Primary);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(formButton);

	return { embeds: [embed], components: [buttonRow] };
}

export function questionEmbed(thread: ThreadChannel, question: Question) {
	const { color } = loadConfig();
	let type = question.type.charAt(0).toUpperCase() + question.type.slice(1);
	if (type === 'Fileupload') type = 'File Upload';
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`Question #${question.order}: ${question.title}`)
		.addFields({ name: 'Question Type', value: type, inline: true });
	if (question.description) embed.setDescription(question.description);
	const unit = type === 'Text' ? 'characters' : type === 'Number' ? 'value' : 'attachments';
	if (!isNaN(question.min) && question.min !== null) embed.addFields({ name: `Minimum ${unit}`, value: `${question.min}`, inline: true });
	if (!isNaN(question.max) && question.max !== null) embed.addFields({ name: `Maximum ${unit}`, value: `${question.max}`, inline: true });

	if (question.required)	return { embeds: [embed] };

	const skipButton = new ButtonBuilder()
		.setCustomId(`skip-${thread.id}-${question.question_id}`)
		.setLabel('Skip')
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(skipButton);

	return { embeds: [embed], components: [row] };
}

export function selectQuestionEmbed(thread: ThreadChannel, question: Question) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`Question #${question.order}: ${question.title}`);
	if (question.description) embed.setDescription(question.description);

	const selectMenu = new StringSelectMenuBuilder()
		.setCustomId(`select-${thread.id}-${question.question_id}`)
		.setPlaceholder('Select an option')
		.setMinValues(question.min)
		.setMaxValues(question.max)
		.addOptions(question.options.map((option) => new StringSelectMenuOptionBuilder()
			.setLabel(option)
			.setValue(option)));

	const skipButton = new ButtonBuilder()
		.setCustomId(`skip-${thread.id}-${question.question_id}`)
		.setLabel('Skip')
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder<StringSelectMenuBuilder>()
		.addComponents(selectMenu);

	const row2 = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(skipButton);

	if (question.required) return { embeds: [embed], components: [row] };

	return { embeds: [embed], components: [row, row2] };
}

export function formSubmittedEmbed(thread: ThreadChannel, rolePermissions: Role[]) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Form submitted!')
		.setDescription('Thank you for submitting your form. Your application will be reviewed shortly.');

	const approveButton = new ButtonBuilder()
		.setCustomId(`approve-${thread.id}`)
		.setLabel('Approve')
		.setStyle(ButtonStyle.Success);

	const denyButton = new ButtonBuilder()
		.setCustomId(`deny-${thread.id}`)
		.setLabel('Deny')
		.setStyle(ButtonStyle.Danger);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(approveButton, denyButton);

	let roleMentionsMsg = '';
	if (rolePermissions.length > 0) {
		for (const rolePermission of rolePermissions) {
			if (rolePermission.permission === 'action' || rolePermission.permission === 'view') {
				roleMentionsMsg += `${roleMention(rolePermission.role_id)} `;
			}
		}
	}

	return { content: roleMentionsMsg, embeds: [embed], components: [buttonRow] };
}

export function formFinishedEmbed(approved: boolean) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Form reviewed!')
		.setDescription(`This form has been ${approved ? 'approved' : 'rejected'}.`);

	return { embeds: [embed] };
}

export function questionRemoveEmbed(question: Question) {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle(`Are you sure you want to remove the question with ID #${question.question_id}?`)
		.setDescription('This will permanently remove the question and all of its answers from this form!');

	const confirmButton = new ButtonBuilder()
		.setCustomId(`confirm-remove-question-${question.question_id}`)
		.setLabel('Confirm')
		.setStyle(ButtonStyle.Danger);

	const cancelButton = new ButtonBuilder()
		.setCustomId(`cancel-remove-question-${question.question_id}`)
		.setLabel('Cancel')
		.setStyle(ButtonStyle.Secondary);

	const buttonRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(confirmButton, cancelButton);

	return { embeds: [embed], components: [buttonRow], ephemeral: true };
}

export function formTutorialEmbed() {
	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('You have successfully created a new form!')
		.setDescription(' Now you can configure it to your liking with the following commands. Once you are done, you can start accepting new applications with the command `/form submit True`')
		.addFields(
			{ name: '/question', value: 'Manage questions from this form.' },
			{ name: '/action', value: 'Manage actions to take on approval/rejection' },
			{ name: '/role', value: 'Manage permissions for specific roles' },
			{ name: '/form', value: 'Manage the form itself' },
		);

	return { embeds: [embed], ephemeral: true };
}