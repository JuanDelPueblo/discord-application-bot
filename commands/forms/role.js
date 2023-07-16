const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { Forms, Roles } = require('@database');
const { color } = require('@config');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Configures which roles can view, act on, or edit a form')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all roles with permissions to view, act on, or edit a form'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('set')
				.setDescription('Set a role to view, act on, or edit a form')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to set permissions for')
						.setRequired(true),
				)
				.addStringOption(option =>
					option.setName('permission')
						.setDescription('The permission to set')
						.setRequired(true)
						.addChoices(
							{ name: 'View applications only', value: 'view' },
							{ name: 'View and take action on applications', value: 'action' },
						),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Removes a role and all their permissions')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to remove all permissions for')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel.id } });

		if (!currentForm) {
			await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true });
			return;
		}

		switch (subcommand) {
		case 'list': {
			const roles = await Roles.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
			if (roles.length === 0) {
				await interaction.reply({ content: 'No roles have permissions for this form!', ephemeral: true });
			} else {
				const embed = new EmbedBuilder()
					.setTitle('Roles with permissions for this form')
					.setColor(color);
				// set up embed fields with roles and permissions
				roles.forEach(role => {
					const roleObj = interaction.guild.roles.cache.get(role.role_id);
					let rolePermissions = 'No permissions set for this role';
					if (role.permission === 'view') rolePermissions = 'Can view applications';
					if (role.permission === 'action') rolePermissions = 'Can view and take action on applications';
					embed.addFields({
						name: `${roleObj.name}`,
						value: rolePermissions,
					});
				});
				await interaction.reply({ embeds: [embed], ephemeral: true });
			}
			break;
		}
		case 'set': {
			const role = await interaction.options.getRole('role');
			const permission = await interaction.options.getString('permission');
			Roles.upsert({
				form_channel_id: currentForm.form_channel_id,
				role_id: role.id,
				permission: permission,
			})
				.then(() => interaction.reply({ content: `Set permissions for <@&${role.id}>`, ephemeral: true }))
				.catch((err) => {
					console.error(err);
					interaction.reply({ content: 'Something went wrong!', ephemeral: true });
				});
			break;
		}
		case 'remove': {
			const roleToRemove = await interaction.options.getRole('role');
			Roles.destroy({ where: { form_channel_id: currentForm.form_channel_id, role_id: roleToRemove.id } })
				.then(() => interaction.reply({ content: `Removed all permissions for <@&${roleToRemove.id}>`, ephemeral: true }))
				.catch(() => interaction.reply({ content: 'Something went wrong!', ephemeral: true }));
			break;
		}
		default: {
			await interaction.reply('Not recognized!');
			break;
		}
		}
	},
};