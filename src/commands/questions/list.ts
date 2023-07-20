import { ChatInputCommandInteraction } from 'discord.js';
import { Questions } from '../../database.js';

export default async function listCommand(interaction: ChatInputCommandInteraction, currentForm: any) {
	const questions = await Questions.findAll({ where: { form_channel_id: currentForm.form_channel_id }, order: ['order'] });
	if (questions.length === 0) {
		await interaction.reply({ content: 'There are no questions configured for this form!', ephemeral: true });
		return;
	}

	let questionList = '';
	for (const question of questions) {
		questionList += `${question.order}. (ID: ${question.question_id}) ${question.title}\n${question.description}\n\n`;
	}

	await interaction.reply({ content: `The questions configured for this form are:\n${questionList}`, ephemeral: true });
}