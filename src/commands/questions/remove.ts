import { BaseInteraction, ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import { questionRemoveEmbed } from '../../utils/embeds.js';

export default async function removeCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const id = await interaction.options.getInteger('id');

	const questions = await currentForm.$get('question', { order: [['order', 'ASC']] });

	const questionToRemove = questions.find((question) => question.question_id === id);

	if (!questionToRemove) {
		await interaction.reply({ content: 'There is no question with that ID configured for this form!', ephemeral: true });
		return;
	}

	// get confirmation as to whenether the user wants to remove the question or not
	const confirmationMsg = await interaction.reply(questionRemoveEmbed(questionToRemove));
	const filter = (i: BaseInteraction) => i.user.id === interaction.user.id;
	const response = await confirmationMsg.awaitMessageComponent({ filter, time: 43_200_000 });

	if (response.customId.startsWith('cancel-remove-question-')) return response.update({ content: 'Question removal cancelled.', components: [], embeds: [] });

	// update the order of the questions
	const removedOrder = questionToRemove.order;
	for (let i = removedOrder; i < questions.length; i++) {
		questions[i].order = questions[i].order - 1;
	}

	await Promise.all(questions.map((question) => question.save()));

	await questionToRemove.destroy();

	await response.update({ content: 'The question has been removed from this form!', components: [], embeds: [] });

	const updatedQuestions = await currentForm.$get('question');

	if (updatedQuestions.length < 1) {
		await currentForm.update({ enabled: false });
		await interaction.followUp({ content: 'This form has no questions! Form submissions have been disabled. Please add a question before toggling submisssions on.', ephemeral: true });
	}
}