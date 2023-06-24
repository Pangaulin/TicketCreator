// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
     */
	execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'close') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || interaction.member.roles.cache.find(role => role.name === 'Ticket Manager')) {
				const confirmationEmbed = new EmbedBuilder()
					.setTitle('Close ticket confirmation')
					.setDescription('Do you really want to close the ticket ?')
					.setColor('Blurple')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				const closeConfirmationButton = new ButtonBuilder()
					.setCustomId('closeConfirmation')
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
			else {
				const noPermissionEmbed = new EmbedBuilder()
					.setTitle('Permission denied')
					.setDescription('You don\'t have the permission to use this button `Permission missing : ManageChannels`\n**People who have the role "Ticket Manager" can manage tickets**')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

		if (interaction.customId === 'closeConfirmation') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || interaction.member.roles.cache.find(role => role.name === 'Ticket Manager')) {
				const timerEmbed = new EmbedBuilder()
					.setTitle('Thank you for using our service !')
					.setDescription('The ticket will be deleted in 5 seconds')
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				interaction.reply({
					embeds: [timerEmbed],
				}).then(() => setTimeout(() => {
					interaction.channel.delete();
				}, 5000));

				return;
			}
			else {
				const noPermissionEmbed = new EmbedBuilder()
					.setTitle('Permission denied')
					.setDescription('You don\'t have the permission to use this button `Permission missing : ManageChannels`')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

	},
};