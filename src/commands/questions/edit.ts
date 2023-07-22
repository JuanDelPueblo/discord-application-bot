import { ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import { editQuestionModal } from '../../utils/modals.js';

export default async function editCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const id = interaction.options.getInteger('id');

	const questions = await currentForm.$get('question');
	const existingQuestion = questions.find((q) => q.question_id === id);
	if (!existingQuestion) {
		await interaction.reply({ content: 'There is no question with that ID configured for this form!', ephemeral: true });
		return;
	}

	// get the question title and description via a modal
	await editQuestionModal(interaction);
	const modalFilter = (i: ModalSubmitInteraction) => i.customId.startsWith(`edit_question-${interaction.channel!.id}`);
	const modalInteraction = await interaction.awaitModalSubmit({ time: 43_200_000, filter: modalFilter })
		.catch(() => {
			interaction.followUp({ content: 'Question update cancelled or something went wrong!', ephemeral: true });
		});

	if (!modalInteraction) return;

	const questionTitle = modalInteraction.fields.getTextInputValue(`question_title-${interaction.channel!.id}`);
	const questionDescription = modalInteraction.fields.getTextInputValue(`question_description-${interaction.channel!.id}`) ?? '';
	const type = existingQuestion.type;

	try {
		switch (type) {
		case 'text':
		case 'number':
		case 'fileupload': {
			await existingQuestion.update({
				title: questionTitle,
				description: questionDescription,
			});

			await modalInteraction.reply({ content: 'This question has been updated!', ephemeral: true });

			break;
		}
		case 'select': {
			// get the options via a collector
			const filter = (m: Message) => m.author.id === modalInteraction.user.id;
			const collector = interaction.channel!.createMessageCollector({ filter, time: 43_200_000 });

			await modalInteraction.reply({ content: 'Please enter the options for this question as individual messages. Type `!done` when you are finished.', ephemeral: true });

			collector.on('collect', (message) => {
				if (message.content.toLowerCase() === '!done') {
					collector.stop();
				} else {
					message.react('👎');
				}
			});

			collector.on('end', async (collected) => {
				const options: string[] = [];

				// add all the options to the array except for the !done message and those with a 👎 reaction
				for (const message of collected.values()) {
					const reaction = await message.reactions.cache.get('👎');

					if (reaction) {
						const users = await reaction.users.fetch();

						if (message.content.toLowerCase() !== '!done' && users.size <= 1) {
							options.push(message.content);
						}
					}
				}

				if (options.length < 1) {
					modalInteraction.followUp({ content: 'You must have at least 2 options!', ephemeral: true });
				} else {
					await existingQuestion.update({
						title: questionTitle,
						description: questionDescription,
						options: options,
						});
					await modalInteraction.followUp({ content: 'This question has been updated!', ephemeral: true });
				}
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