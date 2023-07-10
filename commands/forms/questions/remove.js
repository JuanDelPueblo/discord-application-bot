const { Questions } = require('@database');

async function removeCommand(interaction, currentForm) {
	const id = await interaction.options.getInteger('id');
	Questions.findOne({ where: { form_channel_id: currentForm.form_channel_id, question_id: id } })
		.then(async question => {
			if (!question) {
				await interaction.reply({ content: 'There is no question with that name configured for this form!', ephemeral: true });
			} else {
				await question.destroy();
				await interaction.reply({ content: 'The question has been removed from this form!', ephemeral: true });
			}
		})
		.catch(async () => {
			await interaction.reply({ content: 'There was an error removing the question!', ephemeral: true });
		});
}

module.exports = { removeCommand };