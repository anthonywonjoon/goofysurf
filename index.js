const fs = require('node:fs');
const path = require('node:path');
const { request } = require('undici');
const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

const surfIdMap = new Map();
surfIdMap.set('bowls', '5842041f4e65fad6a7708b42');
surfIdMap.set('canoes', '5842041f4e65fad6a7708b35');
surfIdMap.set('kewalos', '5a983b55ab43c7001a4129d9');
surfIdMap.set('makaha', '5842041f4e65fad6a7708dfd');
surfIdMap.set('haleiwa', '5842041f4e65fad6a7708df5');
surfIdMap.set('chuns', '5842041f4e65fad6a7708899');

// Require the necessary discord.js classes
const { Client, EmbedBuilder, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

/// Client Interaction Handler
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;
	await interaction.deferReply();

	if (commandName === 'cat') {
		const catResult = await request('https://aws.random.cat/meow');
		const { file } = await catResult.body.json();
		interaction.editReply({ files: [{ attachment: file, name: 'cat.png' }] });
	} else if (commandName === 'urban') {
		const spot = interaction.options.getString('term');
		const id = surfIdMap.get(spot);

		const report = await request(`https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=${id}`);
		const { list } = await dictResult.body.json();

		if (!list.length) {
			return interaction.editReply(`No results found for **${term}**.`);
		}

		const [answer] = list;

		const embed = new EmbedBuilder()
			.setColor(0xEFFF00)
			.setTitle(spot)
			.addFields(
				{ name: 'Definition', value: trim(answer.definition, 1024) },
				{ name: 'Example', value: trim(answer.example, 1024) },
				{
					name: 'Rating',
					value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down.`,
				},
			);
		interaction.editReply({ embeds: [embed] });
	}
});


// Log in to Discord with your client's token
client.login(token);
