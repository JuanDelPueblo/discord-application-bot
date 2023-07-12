const { Collection, Events, ChannelType } = require('discord.js');
const { Forms, Questions } = require('@database');
const { textQuestionCollector } = require('@utils/questions.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			const { cooldowns } = interaction.client;

			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.isButton()) {
			const button = interaction.customId;

			if (button.startsWith('form-')) {
				const formChannelId = button.split('-')[1];
				const form = await Forms.findOne({
					where: { form_channel_id: formChannelId },
					include: [{
						model: Questions,
						as: 'questions',
						order: [['order', 'ASC']],
					}],
				});
				if (!form.enabled) {
					return interaction.reply({ content: 'This form is currently not open for submissions.', ephemeral: true });
				}
				await interaction.deferUpdate();
				const thread = await interaction.channel.threads.create({
					name: `${interaction.user.username}'s application`,
					autoArchiveDuration: 10080,
					type: ChannelType.PrivateThread,
				});
				await thread.members.add(interaction.user.id);
				await thread.send({ content: `Welcome to your application, ${interaction.user}! Please answer the following questions to the best of your ability.` });

				for (const question of form.questions) {
					switch (question.type) {
					case 'text': {
						const response = await textQuestionCollector(interaction, thread, question);
						if (response === undefined) return;
						break;
					}
					default: {
						console.error(`Unknown question type ${question.type}`);
						break;
					}
					}
				}
			}
		}
	},
};