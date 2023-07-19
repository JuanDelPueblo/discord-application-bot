import { ApplicationCommandOptionType, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { loadConfig } from '../index.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Get all commands')
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
	const commands = interaction.client.commands;

	const { color } = loadConfig();
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Commands')
		.setDescription('All commands\n [] = optional, <> = required');

	commands.forEach(command => {
		if (command.data.options.length > 0) {
			command.data.options.forEach(option => {
				if (option.type === ApplicationCommandOptionType.Subcommand) {
					let args = '';
					if (option.options) {
						option.options.forEach(subOption => {
							if (subOption.type !== ApplicationCommandOptionType.Subcommand && subOption.required) {
								args += ` <${subOption.name}>`;
							} else if (subOption.type !== ApplicationCommandOptionType.Subcommand) {
								args += ` [${subOption.name}]`;
							}
						});
					}
					embed.addFields({
						name: `/${command.data.name} ${option.name}${args}`,
						value: option.description,
					});
				}
			});
		} else {
			embed.addFields({
				name: `/${command.data.name}`,
				value: command.data.description,
			});
		}
	});

	// send the embed
	await interaction.reply({ embeds: [embed] });
}

export default {
	data,
	execute,
};