const { questionEmbed, selectQuestionEmbed } = require('./embeds.js');

async function textQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed);

		const filter = m => {
			return m.author.id === interaction.user.id && (m.content.length >= question.min && m.content.length <= question.max);
		};

		const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

		collector.on('ignore', async m => {
			if ((m.content.length < question.min || m.content.length > question.max) && m.author.id === interaction.user.id) {
				await thread.send({ content: `Your response must be between ${question.min} and ${question.max} characters long. Please answer again.`, ephemeral: true });
			}
		});

		collector.on('end', async collected => {
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
}

async function numberQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed);

		const filter = m => {
			const value = parseInt(m.content);
			return m.author.id === interaction.user.id && (value >= question.min && value <= question.max);
		};

		const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

		collector.on('ignore', async m => {
			const value = parseInt(m.content);
			if ((value < question.min || value > question.max) && m.author.id === interaction.user.id) {
				await thread.send({ content: `Your response must be between ${question.min} and ${question.max}. Please answer again.`, ephemeral: true });
			} else if (isNaN(value) && m.author.id === interaction.user.id) {
				await thread.send({ content: 'Your response must be a number. Please answer again.', ephemeral: true });
			}
		});

		collector.on('end', async collected => {
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
}

async function selectQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = selectQuestionEmbed(thread, question);
		thread.send(embed)
			.then(async msg => {
				const selectFilter = i => i.user.id === interaction.user.id;
				const selection = await msg.awaitMessageComponent({ selectFilter, time: 43_200_000 });
				await selection.deferUpdate();
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
		thread.send(embed);

		const filter = m => {
			return m.author.id === interaction.user.id && m.attachments.size >= question.min && m.attachments.size <= question.max;
		};

		const collector = thread.createMessageCollector({ filter, max: 1, time: 43_200_000 });

		collector.on('ignore', async m => {
			if (m.attachments.size === 0 && m.author.id === interaction.user.id) {
				await thread.send({ content: 'Your response must include an attachment. Please answer again.', ephemeral: true });
			} else if ((m.attachments.size < question.min || m.attachments.size > question.max) && m.author.id === interaction.user.id) {
				await thread.send({ content: `Your response must include between ${question.min} and ${question.max} attachments. Please upload the requested files again.`, ephemeral: true });
			}
		});

		collector.on('end', async collected => {
			if (collected.size === 0) {
				await thread.send({ content: 'No response given in time.', ephemeral: true });
				reject(new Error('No response given in time.'));
				return;
			}

			const attachments = collected.first().attachments;
			const response = attachments.map(attachment => attachment.url);
			let msg = 'Your response was:';
			response.forEach(url => {
				msg += `\n${url}`;
			});
			await thread.send({ content: msg, ephemeral: true });
			resolve(response);
		});
	});
}

module.exports = { textQuestionCollector, numberQuestionCollector, selectQuestionCollector, fileUploadQuestionCollector };