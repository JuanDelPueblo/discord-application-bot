const { Questions } = require('@database');
const { editQuestionModal } = require('@utils/modals.js');

async function addCommand(interaction, currentForm) {
	const type = interaction.options.getString('type');
	const required = interaction.options.getBoolean('required') ?? false;
	let min = interaction.options.getInteger('min');
	let max = interaction.options.getInteger('max');

	await editQuestionModal(interaction);
	const modalFilter = i => i.customId.startsWith(`edit_question-${interaction.channel.id}`);
	const modalInteraction = await interaction.awaitModalSubmit({ time: 43_200_000, modalFilter })
		.catch(() => {
			interaction.followUp({ content: 'Question creation cancelled or something went wrong!', ephemeral: true });
		});

	if (!modalInteraction) return;

	const questionTitle = modalInteraction.fields.getTextInputValue(`question_title-${interaction.channel.id}`);
	const questionDescription = modalInteraction.fields.getTextInputValue(`question_description-${interaction.channel.id}`) ?? '';

	const questions = await Questions.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
	const questionOrder = questions.length + 1;

	try {
		switch (type) {
		case 'text': {
			min = min ?? 1;
			max = max ?? 2000;

			if (min > max) return interaction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

			if (min > 2000 || min < 1 || max > 2000 || max < 1) {
				return modalInteraction.reply({ content: 'The minimum or maximum amount of characters cannot be greater than 2000 or less than 1 for this type of question!', ephemeral: true });
			}

			await Questions.create({
				form_channel_id: currentForm.form_channel_id,
				type: type,
				title: questionTitle,
				description: questionDescription,
				required: required,
				min: min,
				max: max,
				order: questionOrder,
			});
			await modalInteraction.reply({ content: 'The question has been added to this form!', ephemeral: true });
			break;
		}
		case 'number': {
			min = min ?? -Number.MAX_VALUE;
			max = max ?? Number.MAX_VALUE;

			if (min > max) return interaction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

			if (min > Number.MAX_VALUE || min < -Number.MAX_VALUE || max > Number.MAX_VALUE || max < -Number.MAX_VALUE) {
				return modalInteraction.reply({ content: 'The minimum or maximum number is too big!', ephemeral: true });
			}

			await Questions.create({
				form_channel_id: currentForm.form_channel_id,
				type: type,
				title: questionTitle,
				description: questionDescription,
				required: required,
				min: min,
				max: max,
				order: questionOrder,
			});
			await modalInteraction.reply({ content: 'The question has been added to this form!', ephemeral: true });
			break;
		}
		case 'fileupload': {
			min = min ?? 1;
			max = max ?? 1;

			if (min > max) return interaction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

			if (min > 10 || min < 1 || max > 10 || max < 1) {
				return modalInteraction.reply({ content: 'The minimum or maximum amount of files cannot be greater than 10 or less than 1 for this type of question!', ephemeral: true });
			}

			await Questions.create({
				form_channel_id: currentForm.form_channel_id,
				type: type,
				title: questionTitle,
				description: questionDescription,
				required: required,
				min: min,
				max: max,
				order: questionOrder,
			});
			await modalInteraction.reply({ content: 'The question has been added to this form!', ephemeral: true });
			break;
		}
		case 'select': {
			min = min ?? 1;
			max = max ?? 1;

			if (min > max) return interaction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

			if (min > 25 || min < 1 || max > 25 || max < 1) {
				return modalInteraction.reply({ content: 'The minimum or maximum amount of options cannot be greater than 25 or less than 1 for this type of question!', ephemeral: true });
			}

			const filter = m => m.author.id === modalInteraction.user.id;
			const collector = interaction.channel.createMessageCollector({ filter, max: 25, time: 43_200_000 });

			await modalInteraction.reply({ content: 'Please enter the options for this question as individual messages. If you made a mistake in one of the selections, please react with the 👎 emoji to remove it from the selections. Type `!done` when you are finished.', ephemeral: true });

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

				await Questions.create({
					form_channel_id: currentForm.form_channel_id,
					type: type,
					title: questionTitle,
					description: questionDescription,
					required: required,
					order: questionOrder,
					min: min,
					max: max,
					options: options,
				});
				await modalInteraction.followUp({ content: 'The question has been added to this form!', ephemeral: true });
			});

			break;
		}
		default: {
			await modalInteraction.reply({ content: 'You did not enter a valid question type!', ephemeral: true });
			return;
		}
		}
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: 'There was an error adding the question!', ephemeral: true });
	}
}

module.exports = { addCommand };