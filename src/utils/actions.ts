import { ButtonInteraction, GuildMember, TextChannel, userMention } from 'discord.js';
import Action from '../models/Action.model.js';

export default async function executeAction(interaction: ButtonInteraction, member: GuildMember, action: Action) {
	try {
		switch (action.do) {
		case 'removerole': {
			const role = interaction.guild!.roles.cache.get(action.role_id);
			if (!role) {
				await interaction.followUp({ content: 'The role for this action no longer exists!', ephemeral: true });
				return;
			}
			if (member.roles.cache.has(role.id)) {
				await member.roles.remove(role);
			}
			break;
		}
		case 'addrole': {
			const role = interaction.guild!.roles.cache.get(action.role_id);
			if (!role) {
				await interaction.followUp({ content: 'The role for this action no longer exists!', ephemeral: true });
				return;
			}
			if (!member.roles.cache.has(role.id)) {
				await member.roles.add(role);
			}
			break;
		}
		case 'ban': {
			const reason = action.reason ?? 'No reason given';
			await interaction.guild!.members.ban(member, { reason });
			break;
		}
		case 'kick': {
			const reason = action.reason ?? 'No reason given';
			await interaction.guild!.members.kick(member, reason);
			break;
		}
		case 'sendmessage': {
			const channel = interaction.guild!.channels.cache.get(action.message_channel_id) as TextChannel;
			if (!channel) {
				await interaction.followUp({ content: 'The channel for this action no longer exists!', ephemeral: true });
				return;
			}
			const message = action.message.replace(/{user}/g, userMention(member.user.id));
			await channel.send(message);
			break;
		}
		case 'sendmessagedm': {
			await member.send(action.message);
			break;
		}
		}
	} catch (error) {
		console.error(error);
		await interaction.followUp({ content: `An error occurred while executing action ${action.name}: ${error}`, ephemeral: true });
	}
}