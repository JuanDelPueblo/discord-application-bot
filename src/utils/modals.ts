import { ActionRowBuilder, CommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export function editFormModal(interaction: CommandInteraction) {
	const modal = new ModalBuilder()
		.setCustomId(`edit_form-${interaction.channel!.id}`)
		.setTitle('Edit Form Details');

	const formTitleInput = new TextInputBuilder()
		.setCustomId(`form_title-${interaction.channel!.id}`)
		.setRequired(true)
		.setLabel('Form Title')
		.setMaxLength(256)
		.setStyle(TextInputStyle.Short);

	const formDescriptionInput = new TextInputBuilder()
		.setCustomId(`form_description-${interaction.channel!.id}`)
		.setRequired(false)
		.setLabel('Form Description')
		.setStyle(TextInputStyle.Paragraph);

	const formButtonTextInput = new TextInputBuilder()
		.setCustomId(`form_button_text-${interaction.channel!.id}`)
		.setRequired(false)
		.setMaxLength(80)
		.setLabel('Form Button Text')
		.setPlaceholder('New Application')
		.setStyle(TextInputStyle.Short);

	const titleRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(formTitleInput);

	const descriptionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(formDescriptionInput);

	const buttonTextRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(formButtonTextInput);

	modal.addComponents(titleRow, descriptionRow, buttonTextRow);

	return interaction.showModal(modal);
}

export function editQuestionModal(interaction: CommandInteraction) {
	const modal = new ModalBuilder()
		.setCustomId(`edit_question-${interaction.channel!.id}`)
		.setTitle('Edit Question');

	const questionTitleInput = new TextInputBuilder()
		.setCustomId(`question_title-${interaction.channel!.id}`)
		.setRequired(true)
		.setMaxLength(256)
		.setLabel('Question Title')
		.setStyle(TextInputStyle.Short);

	const questionDescriptionInput = new TextInputBuilder()
		.setCustomId(`question_description-${interaction.channel!.id}`)
		.setRequired(false)
		.setLabel('Question Description')
		.setStyle(TextInputStyle.Paragraph);

	const titleRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(questionTitleInput);

	const descriptionRow = new ActionRowBuilder<TextInputBuilder>()
		.addComponents(questionDescriptionInput);

	modal.addComponents(titleRow, descriptionRow);

	return interaction.showModal(modal);
}
