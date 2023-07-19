import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Questions, Actions, Roles, Applications } from '../../database.js';

export default async function eraseCommand(interaction, currentForm) {
	const confirm = new ButtonBuilder()
		.setCustomId(`erase-${currentForm.form_channel_id}`)
		.setLabel('Erase Form')
		.setStyle(ButtonStyle.Danger);

	const cancel = new ButtonBuilder()
		.setCustomId(`cancel-${currentForm.form_channel_id}`)
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
		const confirmation = await response.awaitMessageComponent({ filter: filter, time: 43_200_000 });

		if (confirmation.customId.startsWith('erase-')) {
			// delete the form embed
			await interaction.channel.messages.fetch(currentForm.embed_message_id).then(msg => msg.delete());
			// destroy everything related to the form by hand
			const questions = await Questions.findAll({
				where: { form_channel_id: currentForm.form_channel_id },
			});
			for (const question of questions) {
				await question.destroy();
			}
			await currentForm.destroy();
			await Actions.destroy({ where: { form_channel_id: currentForm.form_channel_id } });
			await Roles.destroy({ where: { form_channel_id: currentForm.form_channel_id } });
			await Applications.destroy({ where: { form_channel_id: currentForm.form_channel_id } });
			await confirmation.update({ content: 'Form has been successfully erased!', components: [] });
		} else if (confirmation.customId === 'cancel') {
			await confirmation.update({ content: 'Form erase cancelled', components: [] });
		}
	} catch (e) {
		console.log(e);
		await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
	}
}