const { questionEmbed, selectQuestionEmbed } = require('./embeds.js');

async function textQuestionCollector(interaction, thread, question) {
	return new Promise((resolve, reject) => {
		const embed = questionEmbed(thread, question);
		thread.send(embed);

		const filter = m => {
			return m.author.id === interaction.user.id && (m.content.length >= question.min && m.content.length <= question.max);
		};

		const collector = thread.createMessageCollector({ filter, max: 1, time: 300_000 });

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
	console.log('numberQuestionCollector');
}

async function selectQuestionCollector(interaction, thread, question) {
	console.log('selectQuestionCollector');
}

async function fileUploadQuestionCollector(interaction, thread, question) {
	console.log('fileUploadQuestionCollector');
}

module.exports = { textQuestionCollector, numberQuestionCollector, selectQuestionCollector, fileUploadQuestionCollector };