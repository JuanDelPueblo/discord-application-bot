const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Begins the process of creating a new form'),
	async execute(interaction) {
		await interaction.reply('setup!');
	},
};