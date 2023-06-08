const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('togglesubmit')
		.setDescription('Enable or disable new applications submissions'),
	async execute(interaction) {
		await interaction.reply('togglesubmit!');
	},
};