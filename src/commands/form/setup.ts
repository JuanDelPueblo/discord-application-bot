import Form from '../../models/Form.model.js';
import { editFormModal } from '../../utils/modals.js';
import { formEmbed, formTutorialEmbed } from '../../utils/embeds.js';
import { ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';

export default async function setupCommand(interaction: ChatInputCommandInteraction) {
	editFormModal(interaction)
		.then(() => {
			const filter = (i: ModalSubmitInteraction) => i.customId.startsWith(`edit_form-${interaction.channel!.id}`);
			return interaction.awaitModalSubmit({ time: 43_200_000, filter });
		})
		.then(async (modalInteraction) => {
			const formTitle = modalInteraction.fields.getTextInputValue(`form_title-${interaction.channel!.id}`);
			const formDescription = modalInteraction.fields.getTextInputValue(`form_description-${interaction.channel!.id}`);
			const formButtonText = modalInteraction.fields.getTextInputValue(`form_button_text-${interaction.channel!.id}`);

			const form = await Form.create({
				form_channel_id: interaction.channel!.id,
				title: formTitle,
				description: formDescription,
				button_text: formButtonText,
			})

			const embed = formEmbed(interaction, form);
			const message = await interaction.channel!.send(embed);
			await Form.update({ embed_message_id: message.id }, { where: { form_channel_id: interaction.channel!.id } });
			await modalInteraction.reply(formTutorialEmbed());
		})
		.catch((err) => {
			console.log(err);
			interaction.followUp({ content: 'Form setup cancelled or something went wrong!', ephemeral: true });
		});
}