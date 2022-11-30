const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {

	},
};
