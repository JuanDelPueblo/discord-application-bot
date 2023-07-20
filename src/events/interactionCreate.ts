import { Events, ChannelType, BaseInteraction, TextChannel, ThreadChannel } from 'discord.js';
import { Forms, Answers } from '../database.js';
import { textQuestionCollector, numberQuestionCollector, selectQuestionCollector, fileUploadQuestionCollector } from '../utils/questions.js';
import { formSubmittedEmbed, formFinishedEmbed } from '../utils/embeds.js';
import executeAction from '../utils/actions.js';
import roleCommand from '../commands/role.js';
import helpCommand from '../commands/help.js';
import questionCommand from '../commands/question.js';
import actionCommand from '../commands/action.js';
import formCommand from '../commands/form.js';


export const name = Events.InteractionCreate;
export async function execute(interaction: BaseInteraction) {
	if (interaction.isChatInputCommand()) {
		const command = interaction.commandName;

		if (!['role', 'help', 'question', 'action', 'form'].includes(command)) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			switch (command) {
			case 'role':
				await roleCommand.execute(interaction);
				break;
			case 'help':
				await helpCommand.execute(interaction);
				break;
			case 'question':
				await questionCommand.execute(interaction);
				break;
			case 'action':
				await actionCommand.execute(interaction);
				break;
			case 'form':
				await formCommand.execute(interaction);
				break;
			}
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	} else if (interaction.isButton()) {
		const button = interaction.customId;

		if (button.startsWith('form-')) { // create a new application thread
			try {
				const formChannelId = button.split('-')[1];
				const form = await Forms.findOne({
					where: { form_channel_id: formChannelId },
				});

				if (!form.enabled) {
					return interaction.reply({ content: 'This form is currently not open for submissions.', ephemeral: true });
				}

				if (form.max) {
					const applications = await form.getApplications({ where: { form_channel_id: formChannelId, user_id: interaction.user.id } });
					if (applications.length >= form.max) {
						return interaction.reply({ content: `You cannot submit more than ${form.max} applications at a time!`, ephemeral: true });
					}
				}

				await interaction.deferUpdate();

				const channel = interaction.channel as TextChannel;
				const thread = await channel.threads.create({
					name: `${interaction.user.username}'s application`,
					autoArchiveDuration: 10080,
					type: ChannelType.PrivateThread,
				});

				// add all roles with permissions to view the form to the thread
				const rolePermissions = await form.getRoles();
				for (const rolePermission of rolePermissions.filter((r: any) => r.permission !== 'none')) {
					const role = await interaction.guild!.roles.fetch(rolePermission.role_id);
					if (role === undefined || null) continue;
					const members = role!.members.values();
					for (const member of members) {
						await thread.members.add(member.user.id);
					}
				}
				await thread.members.add(interaction.user.id);
				await thread.send({ content: `Welcome to your application, ${interaction.user}! Please answer the following questions to the best of your ability.` });

				const application = await form.createApplication({
					form_channel_id: interaction.channel!.id,
					thread_id: thread.id,
					user_id: interaction.user.id,
					submitted: false,
				});

				// send all questions in order for the applicant to answer
				const questions = await form.getQuestions({ order: [['order', 'ASC']] });
				for (const question of questions) {
					switch (question.type) {
					case 'text': {
						const response = await textQuestionCollector(interaction, thread, question);
						if (response === undefined) break;
						if (response === undefined && question.required) {
							const updatedThread = await interaction.guild!.channels.fetch(thread.id);
							if (updatedThread) {
								updatedThread.delete();
							}
							return;
						}
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
						if (response === undefined && question.required) {
							const updatedThread = await interaction.guild!.channels.fetch(thread.id);
							if (updatedThread) {
								updatedThread.delete();
							}
							return;
						}
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
						if (response === undefined && question.required) {
							const updatedThread = await interaction.guild!.channels.fetch(thread.id);
							if (updatedThread) {
								updatedThread.delete();
							}
							return;
						}
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
						if (response === undefined && question.required) {
							const updatedThread = await interaction.guild!.channels.fetch(thread.id);
							if (updatedThread) {
								updatedThread.delete();
							}
							return;
						}
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
				await thread.send(formSubmittedEmbed(thread, rolePermissions));
				await application.update({
					submitted: true,
					submitted_at: new Date(),
				});
			} catch (error) {
				if (error.message === 'Unknown Channel') {
					return interaction.followUp({ content: 'Your application has been deleted either manually or due to inactivity.', ephemeral: true });
				}
				console.error(error);
				return interaction.followUp({ content: 'Unable to create application thread.', ephemeral: true });
			}
		} else if (button.startsWith('approve-') || button.startsWith('deny-')) { // approve or deny an application
			try {
				const approved = button.startsWith('approve-');

				const thread = interaction.channel as ThreadChannel;
				const form = await Forms.findOne({
					where: { form_channel_id: thread.parentId },
				});
				if (form === null) {
					return interaction.reply({ content: 'Unable to find form for this application.', ephemeral: true });
				}

				// check if the user has permission to approve/deny applications
				const rolePermissions = await form.getRoles();
				const roles = await Promise.all(rolePermissions
					.filter((r: any) => r.permission === 'action')
					.map(async (role: any) => await interaction.guild!.roles.fetch(role.role_id)));
				const member = await interaction.guild!.members.fetch(interaction.user.id);
				let hasPermission = false;
				for (const role of roles) {
					if (role === undefined) continue;
					if (member.roles.cache.some(r => r.name === role.name)) {
						hasPermission = true;
					}
				}
				if (!hasPermission) {
					await interaction.deferUpdate();
					return;
				}

				// update the application with the approval status
				const applications = await form.getApplications({
					where: { thread_id: button.split('-')[1] },
				});
				const application = applications[0];
				await application.update({
					approved,
				});
				await interaction.reply(formFinishedEmbed(approved));

				// get all actions for this form
				const actions = await form.getActions();
				if (actions.length === 0) {
					return interaction.followUp({ content: 'This form has no actions set.', ephemeral: true });
				}

				const appMember = await interaction.guild!.members.fetch(application.user_id);
				if (appMember === null) {
					return interaction.followUp({ content: 'Unable to find member for this application. Cannot execute actions if the member is not present in the guild.', ephemeral: true });
				}

				// execute actions
				let threadDeleted = false;
				await Promise.all(actions.map(async (action: any) => {
					if (action.when === 'approved' && approved) {
						if (action.do === 'delete') {
							await thread.delete();
							threadDeleted = true;
						} else {
							await executeAction(interaction, appMember, action);
						}
					} else if (action.when === 'rejected' && !approved) {
						if (action.do === 'delete') {
							await thread.delete();
							threadDeleted = true;
						} else {
							await executeAction(interaction, appMember, action);
						}
					}
				}));
				if (!threadDeleted) {
					await thread.setArchived(true);
				} else {
					await application.destroy();
				}
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
			}
		}
	} else if (interaction.isAutocomplete()) {
		const command = interaction.commandName;

		if (!command) return;

		try {
			switch (command) {
			case 'action':
				await actionCommand.autocomplete(interaction);
			case 'question':
				await questionCommand.autocomplete(interaction);
			}
		} catch (error) {
			console.error(error);
		}
	}
}