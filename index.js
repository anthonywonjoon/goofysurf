const fs = require('node:fs');
const path = require('node:path');
const { request } = require('undici');
const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

// 2d array with spots & ids
const surfSpots = [
	['bowls', '5842041f4e65fad6a7708b42'],
	['canoes', '5842041f4e65fad6a7708b35'],
	['kewalos', '5a983b55ab43c7001a4129d9'],
	['makaha', '5842041f4e65fad6a7708dfd'],
	['haleiwa', '5842041f4e65fad6a7708df5'],
	['chuns', '5842041f4e65fad6a7708899'],
	['pipeline', '5842041f4e65fad6a7708890'],
	["pua'ena", '584204204e65fad6a7709057'],
	['vland', '5842041f4e65fad6a7708df4'],
	['populars', '5842041f4e65fad6a7708b32']
];

// hashmap to hold spot
const surfIdMap = new Map();
for (i = 0; i < surfSpots.length; i++) {
	surfIdMap.set(surfSpots[i][0], surfSpots[i][1]);
}

// Require the necessary discord.js classes
const { Client, EmbedBuilder, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
 
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// external command folders
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

	if (commandName === 'surfreport') { // for /surfreport command
		
		const spot = interaction.options.getString('location');
		if (spot == null) { return interaction.editReply(`Please enter a location`); }
		if (!surfIdMap.get(spot.toLowerCase())) { return interaction.editReply(`No results found for **${spot}**.`); }
		const id = surfIdMap.get(spot.toLowerCase());
		const waveURL = `https://services.surfline.com/kbyg/spots/forecasts/wave?spotId=${id}&days=1&intervalHours=3`;
		const windURL = `https://services.surfline.com/kbyg/spots/forecasts/wind?spotId=${id}&days=1&intervalHours=3`;
		const tideURL = `https://services.surfline.com/kbyg/spots/forecasts/tides?spotId=${id}&days=1&intervalHours=3`;

		var wave = fetch(waveURL).then(res => res.json());
		var wind = fetch(windURL).then(res => res.json());
		var tide = fetch(tideURL).then(res => res.json());

		Promise.all([wave, wind, tide]).then(([waveJSON, windJSON, tideJSON]) => {
			// wave data
			waveData = waveJSON.data['wave'][0];
			optimalWave = 3;
			if (waveData['surf']['optimalScore'] == 0) { optimalWave = "Ass"; }
			else if (waveData['surf']['optimalScore'] == 1) { optimalWave = "Good"; }
			else if (waveData['surf']['optimalScore'] == 2) { optimalWave = "Optimal"; }

			// wind data
			windData = windJSON.data['wind'][0];
			optimalWind = 3;
			if (windData['optimalScore'] == 0) { optimalWind = "Ass"; }
			else if (windData['optimalScore'] == 1) { optimalWind = "Good"; }
			else if (windData['optimalScore'] == 2) { optimalWind = "Optimal"; }

			// tide data
			tideData = tideJSON.data['tides'][0];
			tide = tideData['type'];

			const embed = new EmbedBuilder()
						.setColor(0x00FFFF)
						.setTitle(spot.toUpperCase())
						.addFields(
							{ name: 'Time', value: JSON.stringify(waveData['timestamp']) },
							{ name: 'Wave', value: `${JSON.stringify(waveData['surf']['min'])} ft - ${JSON.stringify(waveData['surf']['max'])} ft || ${JSON.stringify(waveData['surf']['humanRelation'])}` },
							{ name: 'Wind', value: `Direction: ${windData['directionType']} || Speed & Gust: ${JSON.stringify(windData['speed']).substring(0,3)} kts gusts up to ${JSON.stringify(windData['gust']).substring(0,3)} kts` },
							{ name: 'Tide', value: tide },
							{ name: 'Scores', value: `Wave: ${optimalWave}, Wind: ${optimalWind}` }
						)
						.setFooter({ text: 'To get available spots, do /surflist' });
			
						return interaction.editReply({ embeds: [embed] });
		})
		.then()
    	.catch(e => {
        	console.warn(e);
    	});	
	}

	if (commandName === 'surflist') { // for /surflist command
		list = "";
		for (i = 0; i < surfSpots.length; i++) {
			list += (surfSpots[i][0] + ', ');
		}

		const embed = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle('Surf Spot List')
			.addFields(
				{ name: 'Available', value: list }
			)

		return interaction.editReply({ embeds: [embed] });
	}
});

// Log in to Discord with your client's token
client.login(token);
