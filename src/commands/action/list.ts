import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import Action from '../../models/Action.model.js';

export default async function listCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const actions = await Action.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
	if (actions.length === 0) {
		await interaction.reply({ content: 'There are no actions configured for this form!', ephemeral: true });
	} else {
		let message = 'The following actions are configured for this form:\n';
		for (const action of actions) {
			message += `${action.name} - ${action.when} - ${action.do}\n`;
		}
		await interaction.reply({ content: message, ephemeral: true });
	}
}