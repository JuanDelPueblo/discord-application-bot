import { ChatInputCommandInteraction } from 'discord.js';
import { Actions } from '../../database.js';

export default async function addCommand(interaction: ChatInputCommandInteraction, currentForm: any, action: any) {
	const name = interaction.options.getString('name');
	const when = interaction.options.getString('when');

	const existingAction = await Actions.findOne({ where: { form_channel_id: currentForm.form_channel_id, name: name } });
	if (existingAction) {
		await interaction.reply({ content: 'There is already an action with that name configured for this form!', ephemeral: true });
		return;
	}

	try {
		switch (action) {
		case 'removerole':
		case 'addrole': {
			const role = interaction.options.getRole('role');

			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				role_id: role!.id,
			});

			await interaction.reply({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'ban':
		case 'kick': {
			const reason = interaction.options.getString('reason');
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				reason: reason,
			});

			await interaction.reply({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'sendmessage': {
			const channel = interaction.options.getChannel('channel');
			const message = interaction.options.getString('message');
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				message_channel_id: channel!.id,
				message: message,
			});

			await interaction.reply({ content: `The action ${name} has been added to this form!`, ephemeral: true });
			break;
		}
		case 'sendmessagedm': {
			const message = interaction.options.getString('message');

			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				message: message,
			});

			await interaction.reply({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'delete': {
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
			});
			await interaction.reply({ content: `The action ${name} has been added to this form!`, ephemeral: true });
			break;
		}
		default: {
			await interaction.reply({ content: 'That is not a valid action!', ephemeral: true });
			break;
		}
		}
	} catch (err) {
		console.error(err);
		await interaction.reply({ content: 'There was an error creating the action!', ephemeral: true });
		return;
	}
}