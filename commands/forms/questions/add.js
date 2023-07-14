const { Questions } = require('@database');
const { editQuestionModal } = require('@utils/modals.js');

async function addCommand(interaction, currentForm, type) {
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
			if ((min ?? 1) > (max ?? 2000)) return modalInteraction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

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
			if ((min ?? -Number.MAX_VALUE) > (max ?? Number.MAX_VALUE)) return modalInteraction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

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
			if ((min ?? 1) > (max ?? 10)) return modalInteraction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

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
			max = max ?? 25;
			if (min > max) return modalInteraction.reply({ content: 'The minimum value cannot be greater than the maximum value!', ephemeral: true });

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

				if (options.length < 1) {
					return modalInteraction.followUp({ content: 'You must have at least 1 option!', ephemeral: true });
				}

				if (options.length < min) {
					min = options.length;
				}

				if (max > options.length) {
					max = options.length;
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