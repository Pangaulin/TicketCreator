const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

client.commands = new Collection();
const commandsFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandsFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsFolderPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsFolderPath);

for (const folder of eventFolders) {
	const eventsPath = path.join(eventsFolderPath, folder);
	const eventFiles = fs.readdirSync(eventsPath);
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

client.login(token);