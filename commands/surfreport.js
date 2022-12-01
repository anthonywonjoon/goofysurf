const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('surfreport')
		.setDescription('Replies with current surf report')
		.addStringOption(option =>
			option
				.setName('location')
				.setDescription('where you want the report from')),
	async execute(interaction) {

	},
};
