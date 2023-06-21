const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong ! 🏓'),
	async execute(interaction) {

		const ping = Date.now() - interaction.createdTimestamp;

		return interaction.reply(`Pong ! 🏓\n\`Latency : ${ping.toString().slice(0, 2)} ms\`\n\`API : ${Math.round(interaction.client.ws.ping)} ms\``);
	},
};