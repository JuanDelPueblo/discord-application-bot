import { Events } from 'discord.js';
import { Forms } from '../database.js';

export const name = Events.ThreadDelete;
export async function execute(thread) {
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
}