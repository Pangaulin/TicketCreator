// eslint-disable-next-line no-unused-vars
const { CommandInteraction, EmbedBuilder, SlashCommandBuilder, Embed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Use this command if you want this bot to your own server'),
	/**
     * @param { CommandInteraction } interaction
     */
	execute(interaction) {
		const inviteEmbed = new EmbedBuilder()
			.setTitle('Invite me !')
			.setColor('Blurple')
			.setDescription('If you want to add me on your server, you can use this [link](https://discord.com/api/oauth2/authorize?client_id=1063835569047752776&permissions=395405551696&scope=bot+applications.commands)')
			.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

		return interaction.reply({
			embeds: [inviteEmbed],
			ephemeral: true,
		});
	},
};