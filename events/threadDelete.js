const { Events } = require('discord.js');
const { Forms } = require('@database');

module.exports = {
	name: Events.ThreadDelete,
	async execute(thread) {
		const form = await Forms.findOne({ where: { form_channel_id: thread.parentId } });
		if (form) {
			const applications = await form.getApplications({
				where: { thread_id: thread.id },
			});
			if (applications.length > 0) {
				const application = applications[0];
				application.destroy();
			}
		}
	},
};