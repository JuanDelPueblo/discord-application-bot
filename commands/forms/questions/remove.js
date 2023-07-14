const { Questions } = require('@database');
const { questionRemoveEmbed } = require('@utils/embeds.js');

async function removeCommand(interaction, currentForm) {
	const id = await interaction.options.getInteger('id');

	const questions = await Questions.findAll({
		where: { form_channel_id: currentForm.form_channel_id },
		order: [['order', 'ASC']],
	});

	const questionToRemove = questions.find(question => question.question_id === id);

	if (!questionToRemove) {
		await interaction.reply({ content: 'There is no question with that ID configured for this form!', ephemeral: true });
		return;
	}

	const confirmationMsg = await interaction.reply(questionRemoveEmbed(questionToRemove));
	const filter = i => i.user.id === interaction.user.id;
	const response = await confirmationMsg.awaitMessageComponent({ filter, time: 43_200_000 });

	if (response.customId.startsWith('cancel-remove-question-')) return response.update({ content: 'Question removal cancelled.', components: [], embeds: [] });

	const removedOrder = questionToRemove.order;
	for (let i = removedOrder; i < questions.length; i++) {
		questions[i].order = questions[i].order - 1;
	}

	await Promise.all(questions.map(question => question.save()));

	await questionToRemove.destroy();

	await response.update({ content: 'The question has been removed from this form!', components: [], embeds: []});

	const updatedQuestions = await Questions.findAll({
		where: { form_channel_id: currentForm.form_channel_id },
	});

	if (updatedQuestions.length < 1) {
		await currentForm.update({ enabled: false });
		await interaction.followUp({ content: 'This form has no questions! Form submissions have been disabled. Please add a question before toggling submisssions on.', ephemeral: true });
	}
}

module.exports = { removeCommand };