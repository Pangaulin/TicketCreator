// eslint-disable-next-line no-unused-vars
const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong ! 🏓'),
	/**
		 *
		 * @param {CommandInteraction} interaction
		 */
	async execute(interaction) {

		const ping = Date.now() - interaction.createdTimestamp;

		return interaction.reply(`Pong ! 🏓\n\`Latency : ${ping.toString().slice(0, 2)} ms\`\n\`API : ${Math.round(interaction.client.ws.ping)} ms\``);
	},
};