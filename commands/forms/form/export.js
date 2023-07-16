const { Parser } = require('@json2csv/plainjs');
const { Answers } = require('@database');
const fs = require('fs');

async function exportCommand(interaction, currentForm) {
	const applications = await currentForm.getApplications();

	if (applications.length === 0) {
		await interaction.reply({ content: 'There are no applications to export!', ephemeral: true });
		return;
	}

	await interaction.deferReply();

	const questions = await currentForm.getQuestions({ order: [['order', 'ASC']] });

	const csvData = [];
	for (const application of applications.filter(app => app.submitted)) {
		const member = interaction.guild.members.cache.get(application.user_id);
		const username = member ? member.user.username : application.user_id;
		await Answers.findAll({ where: { thread_id: application.thread_id } }).then(answers => {
			const applicationData = {
				'Username': username,
				'Submitted at': application.submitted_at,
				'Approved': application.approved,
			};
			for (const question of questions) {
				const answer = answers.find(a => a.question_id === question.question_id);
				applicationData[question.title] = answer ? answer.answer.content : '';
			}
			csvData.push(applicationData);
		});
	}

	const parser = new Parser();
	const parsedData = parser.parse(csvData);

	if (!fs.existsSync('./data')) {
		fs.mkdirSync('./data');
	}

	fs.writeFileSync(`./data/${currentForm.form_channel_id}.csv`, parsedData);
	interaction.editReply({ content: 'Here is the CSV file for the form:', files: [`./data/${currentForm.form_channel_id}.csv`] });
}

module.exports = { exportCommand };