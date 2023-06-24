// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, ButtonBuilder, ActionRowBuilder, ModalBuilder, EmbedBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
	 * @param {ButtonInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'closeWithReason') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || interaction.member.roles.cache.find(role => role.name === 'Ticket Manager')) {
				const confirmationEmbed = new EmbedBuilder()
					.setTitle('Close ticket confirmation')
					.setDescription('Do you really want to close the ticket ?')
					.setColor('Blurple')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				const closeConfirmationButton = new ButtonBuilder()
					.setCustomId('closeWithReasonConfirmation')
					.setEmoji('✔️')
					.setLabel('Close the ticket')
					.setStyle(ButtonStyle.Secondary);

				const row = new ActionRowBuilder()
					.addComponents(closeConfirmationButton);

				return interaction.reply({
					embeds: [confirmationEmbed],
					components: [row],
				});
			}
		}

		if (interaction.customId === 'closeWithReasonConfirmation') {
			const modal = new ModalBuilder()
				.setCustomId('mymodal')
				.setTitle('Reason of closing ticket');

			const reason = new TextInputBuilder()
				.setCustomId('reason')
				.setRequired(true)
				.setPlaceholder('Example : "Resolved"')
				.setLabel('Why do you want to close the ticket ?')
				.setStyle(TextInputStyle.Paragraph);

			const row = new ActionRowBuilder().addComponents(reason);

			modal.addComponents(row);

			await interaction.showModal(modal);
		}
	},
};