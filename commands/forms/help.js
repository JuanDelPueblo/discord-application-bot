const {  ApplicationCommandOptionType, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const config = require('@config');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get all commands'),
	async execute(interaction) {
		const commands = interaction.client.commands;

		const embed = new EmbedBuilder()
			.setColor(config.color)
			.setTitle('Commands')
			.setDescription('All commands\n [] = optional, <> = required');

		commands.forEach(command => {
			if (command.data.options.length > 0) {
				command.data.options.forEach(option => {
					if (option.type === ApplicationCommandOptionType.SUB_COMMAND) {
						let args = '';
						if (option.options) {
							option.options.forEach(subOption => {
								if (subOption.required) {
									args += ` <${subOption.name}>`;
								} else {
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
	},
};