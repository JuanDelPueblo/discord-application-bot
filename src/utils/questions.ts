import { BaseInteraction, ButtonInteraction, Message, StringSelectMenuInteraction, ThreadChannel } from 'discord.js';
import { questionEmbed, selectQuestionEmbed } from './embeds.js';
import Question from '../models/Question.model.js';

export async function textQuestionCollector(interaction: BaseInteraction, thread: ThreadChannel, question: Question) {
	return new Promise((resolve, reject) => {
		try {
			const embed = questionEmbed(thread, question);
			thread.send(embed).then(msg => {
				const min = question.min ?? 1;
				const max = question.max ?? 2000;

				const filter = (m: Message) => {
					return m.author.id === interaction.user.id && (m.content.length >= min && m.content.length <= max);
				};

				let questionSkipped = false;
				const skipFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;
				msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
					.then(i => {
						i.deferUpdate();
						questionSkipped = true;
						collector.stop();
					})
					.catch(err => {
						if (err.message === 'Collector received no interactions before ending with reason: threadDelete'
							|| err.message === 'Collector received no interactions before ending with reason: time') {
							return;
						}
						console.log(err);
					});

				const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

				collector.on('ignore', async m => {
					if ((m.content.length < min || m.content.length > max) && m.author.id === interaction.user.id) {
						await thread.send({ content: `Your response must be between ${min} and ${max} characters long. Please answer again.` });
					}
				});

				collector.on('end', async collected => {
					if (questionSkipped) {
						await thread.send({ content: 'Question skipped.' });
						resolve(undefined);
						return;
					}
					if (collected.size === 0) {
						if (collector.endReason !== 'threadDelete') {
							await thread.send({ content: 'No response given in time.' });
						}
						resolve(undefined);
						return;
					}

					const response = collected.first()!.content;
					await thread.send({ content: `Your response was: ${response}`});
					resolve(response);
				});
			});
		} catch (err) {
			if (err.message === 'Unknown Channel') {
				resolve(undefined);
				return;
			}
			console.log(err);
			reject(err);
		}
	});
}

export async function numberQuestionCollector(interaction: BaseInteraction, thread: ThreadChannel, question: Question) {
	return new Promise((resolve, reject) => {
		try {
			const embed = questionEmbed(thread, question);
			thread.send(embed).then(msg => {
				const filter = (m: Message) => {
					const value = parseInt(m.content);
					if (isNaN(value)) return false;
					return (question.min ? (value >= question.min) : true) && (question.max ? (value <= question.max) : true);
				};

				let questionSkipped = false;
				const skipFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;
				msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
					.then(i => {
						i.deferUpdate();
						questionSkipped = true;
						collector.stop();
					})
					.catch(err => {
						if (err.message === 'Collector received no interactions before ending with reason: threadDelete'
							|| err.message === 'Collector received no interactions before ending with reason: time') {
							return;
						}
						console.log(err);
					});

				const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

				collector.on('ignore', async m => {
					const value = parseInt(m.content);
					if (m.author.id === interaction.user.id) {
						if (isNaN(value)) {
							await thread.send({ content: 'Your response must be a number. Please answer again.' });
						} else if (question.min && question.max) {
							if (value < question.min || value > question.max) {
								await thread.send({ content: `Your response must be between ${question.min} and ${question.max}. Please answer again.` });
							}
						} else if (question.min && value < question.min) {
							await thread.send({ content: `Your response must be greater than ${question.min}. Please answer again.`});
						} else if (question.max && value > question.max) {
							await thread.send({ content: `Your response must be less than ${question.max}. Please answer again.`});
						}
					}
				});

				collector.on('end', async collected => {
					if (questionSkipped) {
						await thread.send({ content: 'Question skipped.' });
						resolve(undefined);
						return;
					}
					if (collected.size === 0) {
						if (collector.endReason !== 'threadDelete') {
							await thread.send({ content: 'No response given in time.' });
						}
						resolve(undefined);
						return;
					}

					const response = parseInt(collected.first()!.content);
					await thread.send({ content: `Your response was: ${response}` });
					resolve(response);
				});
			});
		} catch (err) {
			if (err.message === 'Unknown Channel') {
				resolve(undefined);
				return;
			}
			console.log(err);
			reject(err);
		}
	});
}

export async function selectQuestionCollector(interaction: BaseInteraction, thread: ThreadChannel, question: Question) {
	return new Promise((resolve, reject) => {
		const embed = selectQuestionEmbed(thread, question);
		thread.send(embed)
			.then(async msg => {
				const selectFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;
				const selection = await msg.awaitMessageComponent({ filter: selectFilter, time: 43_200_000 }) as ButtonInteraction | StringSelectMenuInteraction;
				await selection.deferUpdate();
				if (selection.customId.startsWith('skip-')) {
					await thread.send({ content: 'Question skipped.' });
					resolve(undefined);
				} else if (selection instanceof StringSelectMenuInteraction) {
					await thread.send({ content: `Your response was: ${selection.values}` });
					resolve(selection.values);
				} else {
					resolve(undefined);
				}
			})
			.catch(async err => {
				if (err.message === 'Collector received no interactions before ending with reason: time') {
					const updatedThread: ThreadChannel = await interaction.guild!.channels.fetch(thread.id) as ThreadChannel;
					if (updatedThread !== null) {
						await updatedThread.send({ content: 'No response given in time.' });
					}
					resolve(undefined);
				} else if (err.message === 'Collector received no interactions before ending with reason: threadDelete') {
					resolve(undefined);
				} else if (err.message === 'Unknown Channel') {
					resolve(undefined);
				}
				console.log(err);
				reject(err);
			});
	});
}

export async function fileUploadQuestionCollector(interaction: BaseInteraction, thread: ThreadChannel, question: Question) {
	return new Promise((resolve, reject) => {
		try {
			const embed = questionEmbed(thread, question);
			thread.send(embed).then(async msg => {
				const min = question.min ?? 1;
				const max = question.max ?? 10;

				const filter = (m: Message) => {
					return m.author.id === interaction.user.id && m.attachments.size >= min && m.attachments.size <= max;
				};

				let questionSkipped = false;
				const skipFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;
				msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
					.then(i => {
						i.deferUpdate();
						questionSkipped = true;
						collector.stop();
					})
					.catch(err => {
						if (err.message === 'Collector received no interactions before ending with reason: threadDelete'
							|| err.message === 'Collector received no interactions before ending with reason: time') {
							return;
						}
						console.log(err);
					});

				const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

				collector.on('ignore', async m => {
					if (m.attachments.size === 0 && m.author.id === interaction.user.id) {
						await thread.send({ content: 'Your response must include an attachment. Please answer again.' });
					} else if ((m.attachments.size < min || m.attachments.size > max) && m.author.id === interaction.user.id) {
						await thread.send({ content: `Your response must include between ${min} and ${max} attachments. Please upload the requested files again.` });
					}
				});

				collector.on('end', async collected => {
					if (questionSkipped) {
						await thread.send({ content: 'Question skipped.' });
						resolve(undefined);
						return;
					}
					if (collected.size === 0) {
						if (collector.endReason !== 'threadDelete') {
							await thread.send({ content: 'No response given in time.' });
						}
						resolve(undefined);
						return;
					}

					const attachments = collected.first()!.attachments;
					const response = attachments.map(attachment => attachment.url);
					let responseMsg = 'Your response was:';
					response.forEach(url => {
						responseMsg += `\n${url}`;
					});
					await thread.send({ content: responseMsg });
					resolve(response);
				});
			});
		} catch (err) {
			if (err.message === 'Unknown Channel') {
				resolve(undefined);
				return;
			}
			console.log(err);
			reject(err);
		}
	});
}