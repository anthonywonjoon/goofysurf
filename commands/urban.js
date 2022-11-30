const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('urban')
		.setDescription('Replies with Pong!')
		.addStringOption(option =>
			option
				.setName('location')
				.setDescription('where you want the report from')),
	async execute(interaction) {

	},
};
