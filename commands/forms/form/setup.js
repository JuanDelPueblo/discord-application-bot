const { Forms } = require('@database');
const { editFormModal } = require('@utils/modals.js');
const { formEmbed, formTutorialEmbed } = require('@utils/embeds.js');

async function setupCommand(interaction) {
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
			};

			Forms.create(formData, { where: { form_channel_id: interaction.channel.id } });

			const embed = formEmbed(interaction, formData);
			interaction.channel.send(embed)
				.then(message => {
					Forms.update({ embed_message_id: message.id }, { where: { form_channel_id: interaction.channel.id } });
					modalInteraction.reply(formTutorialEmbed());
				});
		})
		.catch((err) => {
			console.log(err);
			interaction.followUp({ content: 'Form setup cancelled or something went wrong!', ephemeral: true });
		});
}

module.exports = { setupCommand };