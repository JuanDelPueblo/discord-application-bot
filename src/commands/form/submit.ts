import { Forms, Questions } from '../../database.js';

export default async function submitCommand(interaction, currentForm) {
	const questions = await Questions.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
	if (questions.length > 0) {
		const newState = await interaction.options.getBoolean('state');
		await Forms.update({ enabled: newState }, { where: { form_channel_id: interaction.channel.id } });
		await interaction.reply({ content: `Form submissions are now ${newState ? 'enabled' : 'disabled'}!`, ephemeral: true });
	} else {
		await interaction.reply({ content: 'This form has no questions! Please add a question before toggling submisssions on', ephemeral: true });
	}
}