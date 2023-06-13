const { ActionRowBuilder, channelMention, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const { Forms } = require('../../database.js');

function editFormModal(interaction) {
	return new Promise((resolve, reject) => {
		const modal = new ModalBuilder()
			.setCustomId(`edit_form-${interaction.channel.id}`)
			.setTitle('Edit Form Details');

		const formTitleInput = new TextInputBuilder()
			.setCustomId(`form_title-${interaction.channel.id}`)
			.setLabel('Form Title')
			.setStyle(TextInputStyle.Short);

		const formDescriptionInput = new TextInputBuilder()
			.setCustomId(`form_description-${interaction.channel.id}`)
			.setLabel('Form Description')
			.setStyle(TextInputStyle.Paragraph);

		const formButtonTextInput = new TextInputBuilder()
			.setCustomId(`form_button_text-${interaction.channel.id}`)
			.setLabel('Form Button Text')
			.setPlaceholder('New Application')
			.setStyle(TextInputStyle.Short);

		const titleRow = new ActionRowBuilder()
			.addComponents(formTitleInput);

		const descriptionRow = new ActionRowBuilder()
			.addComponents(formDescriptionInput);

		const buttonTextRow = new ActionRowBuilder()
			.addComponents(formButtonTextInput);

		modal.addComponents(titleRow, descriptionRow, buttonTextRow);

		interaction.showModal(modal)
			.then(() => {
				const filter = i => i.customId.startsWith(`edit_form-${interaction.channel.id}`);
				interaction.awaitModalSubmit({ time: 43_200_000, filter })
					.then(async (modalInteraction) => {
						const formTitle = modalInteraction.fields.getTextInputValue(`form_title-${interaction.channel.id}`);
						const formDescription = modalInteraction.fields.getTextInputValue(`form_description-${interaction.channel.id}`);
						const formButtonText = modalInteraction.fields.getTextInputValue(`form_button_text-${interaction.channel.id}`);

						try {
							await Forms.upsert(
								{
								  form_channel_id: interaction.channel.id,
								  title: formTitle,
								  description: formDescription,
								  button_text: formButtonText,
								},
								{ where: { form_channel_id: interaction.channel.id } }
							  );
							resolve();
						} catch (err) {
							reject(err);
						}
					})
					.catch(err => {
						reject(err);
					});
			})
			.catch(reject);
	});
}



module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('form')
		.setDescription('Form commands')
		.addSubcommand(subcommand =>
			subcommand.setName('submit')
				.setDescription('Enable or disable new applications submissions')
				.addBooleanOption(option =>
					option.setName('state')
						.setDescription('The state to set')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('setup')
				.setDescription('Begins the process of creating a new form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('export')
				.setDescription('Exports all applications in the current form in a .csv file')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('erase')
				.setDescription('Erases all applications in the current form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('edit')
				.setDescription('Edit the application prompt')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all forms and their respective channels')
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel.id } });

		if (!currentForm && !['list', 'setup'].includes(subcommand)) {
			await interaction.reply('This channel is not a form channel!');
			return;
		}

		switch (subcommand) {
			case 'submit':
				await interaction.reply('Submit!');
				break;
			case 'setup':
				if (currentForm) {
					await interaction.reply('This channel is already a form channel!');
				} else {
					editFormModal(interaction)
						.then(() => interaction.reply('Form created!'))
						.catch(err => {
							console.error(err);
							interaction.reply('Something went wrong!');
						});
				}
				break;
			case 'export':
				await interaction.reply('Export!');
				break;
			case 'erase':
				await interaction.reply('Erase!');
				break;
			case 'edit':
				editFormModal(interaction)
					.then(() => interaction.reply('Form edited!'))
					.catch(err => {
						console.error(err);
						interaction.reply('Something went wrong!');
					});
				break;
			case 'list':
				const forms = await Forms.findAll();
				const formsList = forms.map(form => `${channelMention(form.form_channel_id)} - ${form.title}`);
				await interaction.reply(formsList.join('\n'));
				break;
			default:
				await interaction.reply('Not recognized!');
				break;
		}
	}
};