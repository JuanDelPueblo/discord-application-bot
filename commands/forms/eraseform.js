const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('eraseform')
		.setDescription('Permanently deletes the form and all data associated to it'),
	async execute(interaction) {
		await interaction.reply('eraseform!');
	},
};