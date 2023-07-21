import { Parser } from '@json2csv/plainjs';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { ChatInputCommandInteraction } from 'discord.js';
import Form from '../../models/Form.model.js';
import Answer from '../../models/Answer.model.js';

interface ApplicationData {
	Username: string;
	'Submitted At': Date;
	Approved: boolean;
	[questionTitle: string]: string | number | string[] | boolean | Date;
}

export default async function exportCommand(interaction: ChatInputCommandInteraction, currentForm: Form) {
	const applications = await currentForm.$get('application');

	if (applications.length === 0) {
		await interaction.reply({ content: 'There are no applications to export!', ephemeral: true });
		return;
	}

	await interaction.deferReply({ ephemeral: true });

	const questions = await currentForm.$get('question', { order: [['order', 'ASC']] });

	// create the CSV data from the applications to export
	const csvData: ApplicationData[] = [];
	for (const application of applications.filter((app) => app.submitted)) {
		const member = interaction.guild!.members.cache.get(application.user_id);
		const username = member ? member.user.username : application.user_id;
		await Answer.findAll({ where: { thread_id: application.thread_id } }).then(answers => {
			const applicationData: ApplicationData = {
				Username: username,
				'Submitted At': application.submitted_at,
				Approved: application.approved,
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

	if (!existsSync('./data')) {
		mkdirSync('./data');
	}

	writeFileSync(`./data/${currentForm.form_channel_id}.csv`, parsedData);
	interaction.editReply({ content: 'Here is the CSV file for the form:', files: [`./data/${currentForm.form_channel_id}.csv`]});
}