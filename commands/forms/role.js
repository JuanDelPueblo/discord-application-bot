const { roleMention, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { Forms, Roles } = require('@database')
const { color } = require('@config')

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Configures which roles can view, act on, or edit a form')
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('Lists all roles with permissions to view, act on, or edit a form')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('set')
				.setDescription('Set a role to view, act on, or edit a form')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to set permissions for')
						.setRequired(true)
				)
				.addBooleanOption(option =>
					option.setName('view')
						.setDescription('Whether the role can view forms')
						.setRequired(false)
				)
				.addBooleanOption(option =>
					option.setName('action')
						.setDescription('Whether the role can act on forms')
						.setRequired(false)
				)
				.addBooleanOption(option =>
					option.setName('edit')
						.setDescription('Whether the role can edit forms')
						.setRequired(false)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Removes a role and all their permissions')
				.addRoleOption(option =>
					option.setName('role')
						.setDescription('The role to remove all permissions for')
						.setRequired(true)
				)
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const currentForm = await Forms.findOne({ where: { form_channel_id: interaction.channel.id } });

		if (!currentForm) {
			await interaction.reply({ content: 'This channel is not a form channel!', ephemeral: true });
			return;
		}

		switch (subcommand) {
			case 'list':
				const roles = await Roles.findAll({ where: { form_channel_id: currentForm.form_channel_id } });
				if (roles.length === 0) {
					await interaction.reply({ content: 'No roles have permissions for this form!', ephemeral: true });
				} else {
					const embed = new EmbedBuilder()
						.setTitle('Roles with permissions for this form')
						.setColor(color);
					roles.forEach(role => {
						const roleObj = interaction.guild.roles.cache.get(role.role_id);
						embed.addFields({
							name: `${roleObj.name}`,
							value: `Can view: ${role.can_view}\nCan take action: ${role.can_take_action}\nCan edit: ${role.can_edit}`,
						});
					});
					await interaction.reply({ embeds: [embed], ephemeral: true });
				}
				break;
			case 'set':
				const role = await interaction.options.getRole('role');
				const view = await interaction.options.getBoolean('view');
				const action = await interaction.options.getBoolean('action');
				const edit = await interaction.options.getBoolean('edit');
				// null check
				Roles.upsert({
					form_channel_id: currentForm.form_channel_id,
					role_id: role.id,
					can_view: view ? view : false,
					can_take_action: action ? action : false, 
					can_edit: edit ? edit : false,
				})
					.then(() => interaction.reply({ content: `Set permissions for <@&${role.id}>`, ephemeral: true }))
					.catch((err) => {
						console.error(err);
						interaction.reply({ content: 'Something went wrong!', ephemeral: true });
					});
				break;
			case 'remove':
				const roleToRemove = await interaction.options.getRole('role');
				Roles.destroy({ where: { form_channel_id: currentForm.form_channel_id, role_id: roleToRemove.id } })
					.then(() => interaction.reply({ content: `Removed all permissions for <@&${roleToRemove.id}>`, ephemeral: true }))
					.catch(() => interaction.reply({ content: 'Something went wrong!', ephemeral: true }));
				break;
			default:
				await interaction.reply('Not recognized!');
				break;
		}
	},
};