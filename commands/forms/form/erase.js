const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Forms } = require('@database');

async function eraseCommand(interaction, currentForm) {
	const confirm = new ButtonBuilder()
		.setCustomId('erase')
		.setLabel('Erase Form')
		.setStyle(ButtonStyle.Danger);

	const cancel = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('Cancel')
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder()
		.addComponents(cancel, confirm);

	const response = await interaction.reply({
		content: 'Are you sure you want to erase this form and all applications related to it?',
		components: [row],
		ephemeral: true,
	});

	const filter = i => i.user.id === interaction.user.id;

	try {
		const confirmation = await response.awaitMessageComponent({ filter: filter, time: 60000 });

		if (confirmation.customId === 'erase') {
			await interaction.channel.messages.fetch(currentForm.embed_message_id).then(msg => msg.delete());
			await Forms.destroy({ where: { form_channel_id: interaction.channel.id } });
			await confirmation.update({ content: 'Form has been successfully erased!', components: [] });
		} else if (confirmation.customId === 'cancel') {
			await confirmation.update({ content: 'Form erase cancelled', components: [] });
		}
	} catch (e) {
		console.log(e);
		await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
	}
}

module.exports = { eraseCommand };