import { Events, ThreadChannel } from 'discord.js';
import Form from '../models/Form.model.js';

export const name = Events.ThreadDelete;
export async function execute(thread: ThreadChannel) {
	const form = await Form.findOne({ where: { form_channel_id: thread.parentId } });
	if (form) {
		const applications = await form.$get('application', { where: { thread_id: thread.id } });
		if (applications.length > 0) {
			const application = applications[0];
			application.destroy();
		}
	}
}