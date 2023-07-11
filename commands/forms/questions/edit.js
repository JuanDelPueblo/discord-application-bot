const { Questions } = require('@database');
const { editQuestionModal } = require('@utils/modals');

async function editCommand(interaction, currentForm) {
	const id = interaction.options.getInteger('id');

	const existingQuestion = await Questions.findOne({ where: { form_channel_id: currentForm.form_channel_id, question_id: id } });
	if (!existingQuestion) {
		await interaction.reply({ content: 'There is no question with that ID configured for this form!', ephemeral: true });
		return;
	}

	await editQuestionModal(interaction);
	const modalFilter = i => i.customId.startsWith(`edit_question-${interaction.channel.id}`);
	const modalInteraction = await interaction.awaitModalSubmit({ time: 43_200_000, modalFilter })
		.catch(() => {
			interaction.followUp({ content: 'Question update cancelled or something went wrong!', ephemeral: true });
		});

	if (!modalInteraction) return;

	const questionTitle = modalInteraction.fields.getTextInputValue(`question_title-${interaction.channel.id}`);
	const questionDescription = modalInteraction.fields.getTextInputValue(`question_description-${interaction.channel.id}`) ?? '';
	const type = existingQuestion.type;

	await interaction.deferReply({ ephemeral: true });
	try {
		switch (type) {
		case 'text':
		case 'number':
		case 'fileupload': {
			await existingQuestion.update({
				form_channel_id: currentForm.form_channel_id,
				question_id: id,
				title: questionTitle,
				description: questionDescription,
			});

			await modalInteraction.reply({ content: 'This question has been updated!', ephemeral: true });

			break;
		}
		case 'select': {
			const filter = m => m.author.id === modalInteraction.user.id;
			const collector = interaction.channel.createMessageCollector({ filter, time: 43_200_000 });

			await modalInteraction.reply({ content: 'Please enter the options for this question as individual messages. Type `!done` when you are finished.', ephemeral: true });

			collector.on('collect', (message) => {
				if (message.content.toLowerCase() === '!done') {
					collector.stop();
				} else {
					message.react('👎');
				}
			});

			collector.on('end', async (collected) => {
				const options = [];

				for (const message of collected.values()) {
					const reaction = await message.reactions.cache.get('👎');

					if (reaction) {
						const users = await reaction.users.fetch();

						if (message.content.toLowerCase() !== '!done' && users.size <= 1) {
							options.push(message.content);
						}
					}
				}

				if (options.length < 2) {
					return modalInteraction.followUp({ content: 'You must have at least 2 options!', ephemeral: true });
				}

				await Questions.update({
					form_channel_id: currentForm.form_channel_id,
					question_id: id,
					title: questionTitle,
					description: questionDescription,
					options: options,
				});
				await modalInteraction.followUp({ content: 'This question has been updated!', ephemeral: true });
				const choices = options.map((option, index) => `${index + 1}. ${option}`).join('\n');
				await modalInteraction.followUp({ content: `**Choices:**\n${choices}`, ephemeral: true });
			});


			break;
		}
		default: {
			await interaction.followUp({ content: 'You did not enter a valid question type!', ephemeral: true });
			return;
		}
		}
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'There was an error updating the question!', ephemeral: true });
	}
}

module.exports = { editCommand };