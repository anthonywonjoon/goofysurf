const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('surflist')
		.setDescription('Replies with list of available surf spots'),
	async execute(interaction) {

	},
};
