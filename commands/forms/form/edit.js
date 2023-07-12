const { Forms } = require('@database');
const { editFormModal } = require('@utils/modals.js');
const { formEmbed } = require('@utils/embeds.js');

async function editCommand(interaction, currentForm) {
	editFormModal(interaction)
		.then(() => {
			const filter = i => i.customId.startsWith(`edit_form-${interaction.channel.id}`);
			return interaction.awaitModalSubmit({ time: 43_200_000, filter });
		})
		.then((modalInteraction) => {
			const formTitle = modalInteraction.fields.getTextInputValue(`form_title-${interaction.channel.id}`);
			const formDescription = modalInteraction.fields.getTextInputValue(`form_description-${interaction.channel.id}`);
			const formButtonText = modalInteraction.fields.getTextInputValue(`form_button_text-${interaction.channel.id}`);

			const formData = {
				form_channel_id: interaction.channel.id,
				title: formTitle,
				description: formDescription,
				button_text: formButtonText,
				embed_message_id: currentForm.embed_message_id,
			};

			Forms.update(formData, { where: { form_channel_id: interaction.channel.id } });

			const embed = formEmbed(interaction, formData);
			interaction.channel.messages.fetch(currentForm.embed_message_id)
				.then(message => {
					message.edit(embed);
					modalInteraction.reply({ content: 'Form successfully edited!', ephemeral: true });
				});
		})
		.catch((err) => {
			console.log(err);
			interaction.followUp({ content: 'Form edit cancelled or something went wrong!', ephemeral: true });
		});
}

module.exports = { editCommand };