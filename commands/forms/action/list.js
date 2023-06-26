const { Actions } = require('@database');

async function listCommand(interaction, currentForm) {
	// TODO: add pagination and embeds
	const actions = await Actions.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
	if (actions.length === 0) {
		await interaction.reply({ content: 'There are no actions configured for this form!', ephemeral: true });
	} else {
		let message = 'The following actions are configured for this form:\n';
		for (const action of actions) {
			message += `${action.name} - ${action.when} - ${action.do}\n`;
		}
		await interaction.reply(message);
	}
}

module.exports = { listCommand };