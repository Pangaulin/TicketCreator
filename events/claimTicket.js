// eslint-disable-next-line no-unused-vars
const { ButtonInteraction, Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
     */
	execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'claim') {

			const claimEmbed = new EmbedBuilder()
				.setTitle('Ticket claimed !')
				.setDescription(`The ticket has been claimed by ${interaction.member}`)
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			interaction.reply({
				embeds: [claimEmbed],
			}).then(() => {
				// not finished
			});
		}
	},
};