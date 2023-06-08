const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('export')
		.setDescription('Exports all applications in the current form in a .csv file'),
	async execute(interaction) {
		await interaction.reply('export!');
	},
};