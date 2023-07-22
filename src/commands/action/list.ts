import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function listCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const actions = await currentForm.$get('action');
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