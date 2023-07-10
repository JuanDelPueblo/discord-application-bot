const { Questions } = require('@database');

async function moveCommand(interaction, currentForm) {
	const id = interaction.options.getInteger('id');
	const position = interaction.options.getInteger('position');

	const question = await Questions.findOne({ where: { form_channel_id: currentForm.form_channel_id, question_id: id } });
	if (!question) {
		await interaction.reply({ content: 'There is no question with that ID configured for this form!', ephemeral: true });
		return;
	}

	await interaction.deferReply({ ephemeral: true });
	try {
		await question.update({
			position: position,
		});

		await interaction.followUp({ content: 'The question has been moved to position ${position}!', ephemeral: true });
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'There was an error moving the question!', ephemeral: true });
	}
}

module.exports = { moveCommand };