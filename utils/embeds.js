const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { color } = require('@config');

module.exports = {
	formEmbed(interaction, formData) {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(formData.title)
			.setDescription(formData.description);

		const formButton = new ButtonBuilder()
			.setCustomId(`form-${interaction.channel.id}`)
			.setLabel(formData.button_text)
			.setStyle(ButtonStyle.Primary);

		const buttonRow = new ActionRowBuilder()
			.addComponents(formButton);

		return { embeds: [embed], components: [buttonRow] };
	},
	questionEmbed(thread, question) {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(`Question #${question.order}: ${question.title}`);
		if (question.description) embed.setDescription(question.description);
		if (question.min && question.max) embed.setFooter({ text: `Min: ${question.min} | Max: ${question.max}` });
		return { embeds: [embed] };
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

		const row = new ActionRowBuilder()
			.addComponents(selectMenu);

		return { embeds: [embed], components: [row] };
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
};