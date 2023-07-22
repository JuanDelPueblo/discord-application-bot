import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';

export default async function removeCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const name = await interaction.options.getString('name');
	currentForm.$get('action')
		.then(async (actions) => {
			const action = actions.find((a) => a.name === name);
			if (action === null || action === undefined) {
				await interaction.reply({ content: 'There is no action with that name configured for this form!', ephemeral: true });
			} else {
				await action.destroy();
				await interaction.reply({ content: `The action ${name} has been removed from this form!`, ephemeral: true });
			}
		})
		.catch(async () => {
			await interaction.reply({ content: 'There was an error removing the action!', ephemeral: true });
		});
}