const { Actions } = require('@database');

async function addCommand(interaction, currentForm) {
	const name = interaction.options.getString('name');
	const when = interaction.options.getString('when');
	const action = interaction.options.getString('do');

	const existingAction = await Actions.findOne({ where: { form_channel_id: currentForm.form_channel_id, name: name } });
	if (existingAction) {
		await interaction.reply({ content: 'There is already an action with that name configured for this form!', ephemeral: true });
		return;
	}

	await interaction.deferReply({ ephemeral: true });
	const filter = m => m.author.id === interaction.user.id;
	try {
		switch (action) {
		case 'removerole':
		case 'addrole': {
			await interaction.editReply({ content: `Please mention the role you would like to ${action === 'addrole' ? 'add' : 'remove'} with this action`, ephemeral: true });
			const response = await interaction.channel.awaitMessages({ filter, max: 1, time: 43_200_000, errors: ['time'] })
				.catch(() => {
					interaction.followUp({ content: 'No roles mentioned in time.', ephemeral: true });
				});

			if (response === undefined) return;

			const role = response.first().mentions.roles.first();
			if (!role) {
				await interaction.followUp({ content: 'You did not mention a role!', ephemeral: true });
				return;
			}

			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				role_id: role.id,
			});

			await interaction.followUp({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'ban':
		case 'kick': {
			await interaction.editReply({ content: `Please enter the reason for the ${action} with this action`, ephemeral: true });
			const response = await interaction.channel.awaitMessages({ filter, max: 1, time: 43_200_000, errors: ['time'] })
				.catch(() => {
					interaction.followUp({ content: 'No reason given in time.', ephemeral: true });
				});

			if (response === undefined) return;

			const reason = response.first().content;
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				reason: reason,
			});

			await interaction.followUp({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'sendmessage': {
			await interaction.editReply({ content: 'Please mention the channel you would like to send the message to with this action', ephemeral: true });
			const firstResponse = await interaction.channel.awaitMessages({ filter, max: 1, time: 43_200_000, errors: ['time'] })
				.catch(() => {
					interaction.followUp({ content: 'No channel mentioned in time.', ephemeral: true });
				});

			if (firstResponse === undefined) return;

			const channel = firstResponse.first().mentions.channels.first();
			if (!channel) {
				interaction.followUp({ content: 'You did not mention a channel!', ephemeral: true });
				return;
			}

			await interaction.followUp({ content: 'Please enter the message you would like to send with this action', ephemeral: true });
			const secondResponse = await interaction.channel.awaitMessages({ filter, max: 1, time: 43_200_000, errors: ['time'] })
				.catch(() => {
					interaction.followUp({ content: 'No message given in time.', ephemeral: true });
				});

			if (secondResponse === undefined) return;

			const message = secondResponse.first().content;
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				channel_id: channel.id,
				message: message,
			});

			await interaction.followUp({ content: `The action ${name} has been added to this form!`, ephemeral: true });
			break;
		}
		case 'sendmessagedm': {
			await interaction.editReply({ content: 'Please enter the message you would like to send with this action', ephemeral: true });
			const response = await interaction.channel.awaitMessages({ filter, max: 1, time: 43_200_000, errors: ['time'] })
				.catch(() => {
					interaction.followUp({ content: 'No message given in time.', ephemeral: true });
				});

			if (response === undefined) return;

			const message = response.first().content;
			if (!message) {
				await interaction.followUp({ content: 'You did not enter a message!', ephemeral: true });
				return;
			}

			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
				message: message,
			});

			await interaction.followUp({ content: `The action ${name} has been added to this form!`, ephemeral: true });

			break;
		}
		case 'delete': {
			await Actions.create({
				form_channel_id: currentForm.form_channel_id,
				name: name,
				when: when,
				do: action,
			});
			await interaction.followUp({ content: `The action ${name} has been added to this form!`, ephemeral: true });
			break;
		}
		default: {
			await interaction.editReply({ content: 'That is not a valid action!', ephemeral: true });
			break;
		}
		}
	} catch (err) {
		console.error(err);
		await interaction.followUp({ content: 'There was an error creating the action!', ephemeral: true });
		return;
	}
}

module.exports = { addCommand };