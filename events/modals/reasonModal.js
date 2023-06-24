// eslint-disable-next-line no-unused-vars
const { Events, ModalSubmitInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
	 * @param {ModalSubmitInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.isModalSubmit()) {
			return;
		}

		if (interaction.customId === 'mymodal') {
			const timerEmbed = new EmbedBuilder()
				.setTitle('Thank you for using our service !')
				.setDescription('The ticket will be deleted in 5 seconds')
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			await interaction.reply({
				embeds: [timerEmbed],
			}).then(() => setTimeout(() => {
				interaction.channel.delete(`${interaction.fields.getTextInputValue('reason')}`);
			}, 5000));

			return;
		}
	},
};