import Form from '../../models/Form.model.js';
import { editFormModal } from '../../utils/modals.js';
import { formEmbed } from '../../utils/embeds.js';
import { ChatInputCommandInteraction, Message, ModalSubmitInteraction } from 'discord.js';

export default async function editCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	editFormModal(interaction)
		.then(() => {
			const filter = (i: ModalSubmitInteraction) => i.customId.startsWith(`edit_form-${interaction.channel!.id}`);
			return interaction.awaitModalSubmit({ time: 43_200_000, filter });
		})
		.then(async (modalInteraction) => {
			const formTitle = modalInteraction.fields.getTextInputValue(`form_title-${interaction.channel!.id}`);
			const formDescription = modalInteraction.fields.getTextInputValue(`form_description-${interaction.channel!.id}`);
			const formButtonText = modalInteraction.fields.getTextInputValue(`form_button_text-${interaction.channel!.id}`);

			await currentForm.update({
				title: formTitle,
				description: formDescription,
				button_text: formButtonText,
				embed_message_id: currentForm.embed_message_id,
			}, { where: { form_channel_id: interaction.channel!.id } });

			const embed = formEmbed(interaction, currentForm);
			const message = await interaction.channel!.messages.fetch(currentForm.embed_message_id)
			await message.edit(embed);
			await modalInteraction.reply({ content: 'Form successfully edited!', ephemeral: true });		
		})
		.catch((err) => {
			console.log(err);
			interaction.followUp({ content: 'Form edit cancelled or something went wrong!', ephemeral: true });
		});
}