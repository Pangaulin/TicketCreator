// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
     */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		const ticketmanager = await interaction.member.roles.cache.find(role => role.name === 'Ticket Manager');

		if (interaction.customId === 'close') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
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
					.setDescription(`You don't have the permission to use this button \n> - You dont have the permission \`ManageChannels\`\n> - You don't have the role ${interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`)
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

		if (interaction.customId === 'closeConfirmation') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
				const timerEmbed = new EmbedBuilder()
					.setTitle('Thank you for using our service !')
					.setDescription('The ticket will be deleted in 5 seconds')
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				interaction.reply({
					embeds: [timerEmbed],
				}).then(() => setTimeout(() => {
					try {
						interaction.channel.delete();
					}
					catch (error) {
						return console.log(error);
					}
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