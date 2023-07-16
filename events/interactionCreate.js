const { Collection, Events, ChannelType } = require('discord.js');
const { Forms, Answers } = require('@database');
const { textQuestionCollector, numberQuestionCollector, selectQuestionCollector, fileUploadQuestionCollector } = require('@utils/questions.js');
const { formSubmittedEmbed, formFinishedEmbed } = require('@utils/embeds.js');
const { executeAction } = require('@utils/actions.js');

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

				const application = await form.createApplication({
					form_channel_id: interaction.channel.id,
					thread_id: thread.id,
					user_id: interaction.user.id,
					submitted: false,
				});

				const questions = await form.getQuestions({ order: [['order', 'ASC']] });
				for (const question of questions) {
					switch (question.type) {
					case 'text': {
						const response = await textQuestionCollector(interaction, thread, question);
						if (response === undefined) break;
						await Answers.create({
							thread_id: thread.id,
							question_id: question.question_id,
							answer: {
								type: 'text',
								content: response,
							},
						});
						break;
					}
					case 'number': {
						const response = await numberQuestionCollector(interaction, thread, question);
						if (response === undefined) break;
						await Answers.create({
							thread_id: thread.id,
							question_id: question.question_id,
							answer: {
								type: 'number',
								content: response,
							},
						});
						break;
					}
					case 'select': {
						const response = await selectQuestionCollector(interaction, thread, question);
						if (response === undefined) break;
						await Answers.create({
							thread_id: thread.id,
							question_id: question.question_id,
							answer: {
								type: 'select',
								content: response,
							},
						});
						break;
					}
					case 'fileupload': {
						const response = await fileUploadQuestionCollector(interaction, thread, question);
						if (response === undefined) break;
						await Answers.create({
							thread_id: thread.id,
							question_id: question.question_id,
							answer: {
								type: 'fileupload',
								content: response,
							},
						});
						break;
					}
					default: {
						console.error(`Unknown question type ${question.type}`);
						break;
					}
					}
				}
				await thread.send(formSubmittedEmbed(thread));
				await application.update({
					submitted: true,
					submitted_at: new Date(),
				});
			} else if (button.startsWith('approve-') || button.startsWith('deny-')) {
				const approved = button.startsWith('approve-');

				const form = await Forms.findOne({
					where: { form_channel_id: interaction.channel.parentId },
				});
				if (form === null) {
					return interaction.reply({ content: 'Unable to find form for this application.', ephemeral: true });
				}

				const applications = await form.getApplications({
					where: { thread_id: button.split('-')[1] },
				});
				const application = applications[0];
				await application.update({
					approved,
				});
				await interaction.reply(formFinishedEmbed(approved));

				const actions = await form.getActions();
				if (actions.length === 0) {
					return interaction.followUp({ content: 'This form has no actions set.', ephemeral: true });
				}

				const member = await interaction.guild.members.fetch(application.user_id);
				if (member === null) {
					return interaction.followUp({ content: 'Unable to find member for this application. Cannot execute actions if the member is not present in the guild.', ephemeral: true });
				}

				const thread = await interaction.guild.channels.fetch(button.split('-')[1]);
				let threadDeleted = false;
				await Promise.all(actions.map(async action => {
					if (action.when === 'approved' && approved) {
						if (action.do === 'delete') {
							await thread.delete();
							threadDeleted = true;
						} else {
							await executeAction(interaction, member, action);
						}
					} else if (action.when === 'rejected' && !approved) {
						if (action.do === 'delete') {
							await thread.delete();
							threadDeleted = true;
						} else {
							await executeAction(interaction, member, action);
						}
					}
				}));
				if (!threadDeleted) {
					await thread.setArchived(true);
				} else {
					await application.destroy();
				}
			}
		}
	},
};