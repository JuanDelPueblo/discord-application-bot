const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { color } = require('@config');

module.exports = {
	formEmbed(interaction, formData) {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(formData.title);

		if (formData.description) embed.setDescription(formData.description);

		const formButton = new ButtonBuilder()
			.setCustomId(`form-${interaction.channel.id}`)
			.setLabel(formData.button_text || 'New Application')
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder()
			.addComponents(formButton);

		return { embeds: [embed], components: [buttonRow] };
	},
	questionEmbed(thread, question) {
		let type = question.type.charAt(0).toUpperCase() + question.type.slice(1);
		if (type === 'Fileupload') type = 'File Upload';
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(`Question #${question.order}: ${question.title}`)
			.addFields({ name: 'Question Type', value: type, inline: true });
		if (question.description) embed.setDescription(question.description);
		const unit = type === 'Text' ? 'characters' : type === 'Number' ? 'value' : 'attachments';
		if (question.min) embed.addFields({ name: `Minimum ${unit}`, value: `${question.min}`, inline: true });
		if (question.max) embed.addFields({ name: `Maximum ${unit}`, value: `${question.max}`, inline: true });

		if (question.required)	return { embeds: [embed] };

		const skipButton = new ButtonBuilder()
			.setCustomId(`skip-${thread.id}-${question.question_id}`)
			.setLabel('Skip')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(skipButton);

		return { embeds: [embed], components: [row] };
	},
	selectQuestionEmbed(thread, question) {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(`Question #${question.order}: ${question.title}`);
		if (question.description) embed.setDescription(question.description);

		const selectMenu = new StringSelectMenuBuilder()
			.setCustomId(`select-${thread.id}-${question.question_id}`)
			.setPlaceholder('Select an option')
			.setMinValues(question.min)
			.setMaxValues(question.max)
			.addOptions(question.options.map(option => new StringSelectMenuOptionBuilder()
				.setLabel(option)
				.setValue(option)));

		const skipButton = new ButtonBuilder()
			.setCustomId(`skip-${thread.id}-${question.question_id}`)
			.setLabel('Skip')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(selectMenu);

		const row2 = new ActionRowBuilder()
			.addComponents(skipButton);

		if (question.required) return { embeds: [embed], components: [row] };

		return { embeds: [embed], components: [row, row2] };
	},
	formSubmittedEmbed(thread) {
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

		const buttonRow = new ActionRowBuilder()
			.addComponents(approveButton, denyButton);

		return { embeds: [embed], components: [buttonRow] };
	},
	formFinishedEmbed(approved) {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle('Form reviewed!')
			.setDescription(`This form has been ${approved ? 'approved' : 'rejected'}.`);

		return { embeds: [embed] };
	},
	questionRemoveEmbed(question) {
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

		const buttonRow = new ActionRowBuilder()
			.addComponents(confirmButton, cancelButton);

		return { embeds: [embed], components: [buttonRow], ephemeral: true };
	},
};