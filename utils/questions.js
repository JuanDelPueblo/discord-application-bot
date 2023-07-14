const { questionEmbed, selectQuestionEmbed } = require('./embeds.js');

async function textQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed).then(msg => {
			const min = question.min ?? 1;
			const max = question.max ?? 2000;

			const filter = m => {
				return m.author.id === interaction.user.id && (m.content.length >= min && m.content.length <= max);
			};


			let questionSkipped = false;
			const skipFilter = i => i.user.id === interaction.user.id;
			msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
				.then(i => {
					i.deferUpdate();
					questionSkipped = true;
					collector.stop();
				})
				.catch(console.error);

			const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

			collector.on('ignore', async m => {
				if ((m.content.length < min || m.content.length > max) && m.author.id === interaction.user.id) {
					await thread.send({ content: `Your response must be between ${min} and ${max} characters long. Please answer again.`, ephemeral: true });
				}
			});

			collector.on('end', async collected => {
				if (questionSkipped) {
					await thread.send({ content: 'Question skipped.' });
					resolve(undefined);
					return;
				}
				if (collected.size === 0) {
					await thread.send({ content: 'No response given in time.', ephemeral: true });
					reject(new Error('No response given in time.'));
					return;
				}

				const response = collected.first().content;
				await thread.send({ content: `Your response was: ${response}`, ephemeral: true });
				resolve(response);
			});
		});
	});
}

async function numberQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed).then(msg => {
			const filter = m => {
				const value = parseInt(m.content);
				if (m.author.id === interaction.user.id) {
					if (isNaN(value)) return false;
					return (question.min ? (value >= question.min) : true) && (question.max ? (value <= question.max) : true);
				}
			};

			let questionSkipped = false;
			const skipFilter = i => i.user.id === interaction.user.id;
			msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
				.then(i => {
					i.deferUpdate();
					questionSkipped = true;
					collector.stop();
				})
				.catch(console.error);

			const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

			collector.on('ignore', async m => {
				const value = parseInt(m.content);
				if (m.author.id === interaction.user.id) {
					if (isNaN(value)) {
						await thread.send({ content: 'Your response must be a number. Please answer again.', ephemeral: true });
					} else if (question.min && question.max) {
						if (value < question.min || value > question.max) {
							await thread.send({ content: `Your response must be between ${question.min} and ${question.max}. Please answer again.`, ephemeral: true });
						}
					} else if (question.min && value < question.min) {
						await thread.send({ content: `Your response must be greater than ${question.min}. Please answer again.`, ephemeral: true });
					} else if (question.max && value > question.max) {
						await thread.send({ content: `Your response must be less than ${question.max}. Please answer again.`, ephemeral: true });
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
					await thread.send({ content: 'No response given in time.', ephemeral: true });
					reject(new Error('No response given in time.'));
					return;
				}

				const response = parseInt(collected.first().content);
				await thread.send({ content: `Your response was: ${response}`, ephemeral: true });
				resolve(response);
			});
		});
	});
}

async function selectQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = selectQuestionEmbed(thread, question);
		thread.send(embed)
			.then(async msg => {
				const selectFilter = i => i.user.id === interaction.user.id;
				const selection = await msg.awaitMessageComponent({ selectFilter, time: 43_200_000 });
				await selection.deferUpdate();
				if (selection.customId.startsWith('skip-')) {
					await thread.send({ content: 'Question skipped.' });
					resolve(undefined);
					return;
				}
				await thread.send({ content: `Your response was: ${selection.values}`, ephemeral: true });
				resolve(selection.values);
			})
			.catch(async err => {
				console.log(err);
				await thread.send({ content: 'No response given in time.', ephemeral: true });
				reject(err);
			});
	});
}

async function fileUploadQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed).then(async msg => {
			const min = question.min ?? 1;
			const max = question.max ?? 10;

			const filter = m => {
				return m.author.id === interaction.user.id && m.attachments.size >= min && m.attachments.size <= max;
			};

			let questionSkipped = false;
			const skipFilter = i => i.user.id === interaction.user.id;
			msg.awaitMessageComponent({ filter: skipFilter, time: 43_200_000 })
				.then(i => {
					i.deferUpdate();
					questionSkipped = true;
					collector.stop();
				})
				.catch(console.error);

			const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

			collector.on('ignore', async m => {
				if (m.attachments.size === 0 && m.author.id === interaction.user.id) {
					await thread.send({ content: 'Your response must include an attachment. Please answer again.', ephemeral: true });
				} else if ((m.attachments.size < min || m.attachments.size > max) && m.author.id === interaction.user.id) {
					await thread.send({ content: `Your response must include between ${min} and ${max} attachments. Please upload the requested files again.`, ephemeral: true });
				}
			});

			collector.on('end', async collected => {
				if (questionSkipped) {
					await thread.send({ content: 'Question skipped.' });
					resolve(undefined);
					return;
				}
				if (collected.size === 0) {
					await thread.send({ content: 'No response given in time.', ephemeral: true });
					reject(new Error('No response given in time.'));
					return;
				}

				const attachments = collected.first().attachments;
				const response = attachments.map(attachment => attachment.url);
				let responseMsg = 'Your response was:';
				response.forEach(url => {
					responseMsg += `\n${url}`;
				});
				await thread.send({ content: responseMsg, ephemeral: true });
				resolve(response);
			});
		});
	});
}

module.exports = { textQuestionCollector, numberQuestionCollector, selectQuestionCollector, fileUploadQuestionCollector };