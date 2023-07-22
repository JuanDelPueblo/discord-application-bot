import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function submitCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const questions = await currentForm.$get('question');
	if (questions.length > 0) {
		const newState = await interaction.options.getBoolean('state');
		await Form.update({ enabled: newState }, { where: { form_channel_id: interaction.channel!.id } });
		await interaction.reply({ content: `Form submissions are now ${newState ? 'enabled' : 'disabled'}!`, ephemeral: true });
	} else {
		await interaction.reply({ content: 'This form has no questions! Please add a question before toggling submisssions on', ephemeral: true });
	}
}