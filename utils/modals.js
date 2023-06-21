const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	editFormModal(interaction) {
		const modal = new ModalBuilder()
			.setCustomId(`edit_form-${interaction.channel.id}`)
			.setTitle('Edit Form Details');

		const formTitleInput = new TextInputBuilder()
			.setCustomId(`form_title-${interaction.channel.id}`)
			.setRequired(true)
			.setLabel('Form Title')
			.setStyle(TextInputStyle.Short);

		const formDescriptionInput = new TextInputBuilder()
			.setCustomId(`form_description-${interaction.channel.id}`)
			.setRequired(true)
			.setLabel('Form Description')
			.setStyle(TextInputStyle.Paragraph);

		const formButtonTextInput = new TextInputBuilder()
			.setCustomId(`form_button_text-${interaction.channel.id}`)
			.setRequired(true)
			.setLabel('Form Button Text')
			.setPlaceholder('New Application')
			.setStyle(TextInputStyle.Short);

		const titleRow = new ActionRowBuilder()
			.addComponents(formTitleInput);

		const descriptionRow = new ActionRowBuilder()
			.addComponents(formDescriptionInput);

		const buttonTextRow = new ActionRowBuilder()
			.addComponents(formButtonTextInput);

		modal.addComponents(titleRow, descriptionRow, buttonTextRow);

		return interaction.showModal(modal);
	},
};
