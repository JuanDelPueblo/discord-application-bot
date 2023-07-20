import { ChatInputCommandInteraction } from "discord.js";

export default async function setMaxCommand(interaction: ChatInputCommandInteraction, currentForm: any) {
	const max = await interaction.options!.getInteger('max');
	await currentForm.update({ max });
	if (max) {
		await interaction.reply({ content: `Set maximum amount of applications per applicant to ${max}.`, ephemeral: true });
	} else {
		await interaction.reply({ content: 'Removed limit on amount of applications per applicant.', ephemeral: true });
	}
}