// eslint-disable-next-line no-unused-vars
const { Events, Client, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {Client} client
	 */
	execute(client) {
		client.user.setPresence({ status: 'dnd', activities: [{ name: '/setup', type: ActivityType.Listening }] });
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};