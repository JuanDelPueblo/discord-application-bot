const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get all commands'),
	async execute(interaction) {
		await interaction.reply('help!');
	},
};