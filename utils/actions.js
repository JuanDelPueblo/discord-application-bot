async function executeAction(interaction, member, action) {
	switch (action.do) {
	case 'removerole': {
		const role = interaction.guild.roles.cache.get(action.role_id);
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
		const role = interaction.guild.roles.cache.get(action.role_id);
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
		await interaction.guild.members.ban(member, { reason });
		break;
	}
	case 'kick': {
		const reason = action.reason ?? 'No reason given';
		await interaction.guild.members.kick(member, { reason });
		break;
	}
	case 'sendmessage': {
		const channel = interaction.guild.channels.cache.get(action.message_channel_id);
		if (!channel) {
			await interaction.followUp({ content: 'The channel for this action no longer exists!', ephemeral: true });
			return;
		}
		await channel.send(action.message);
		break;
	}
	case 'sendmessagedm': {
		await member.send(action.message);
		break;
	}
	}
}

module.exports = {
	executeAction,
};