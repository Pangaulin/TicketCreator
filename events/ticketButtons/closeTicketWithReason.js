// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, ButtonBuilder, ActionRowBuilder, ModalBuilder, EmbedBuilder, ButtonStyle, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
	 * @param { ButtonInteraction } interaction
	 */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (!interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')) {
			const owner = await interaction.guild.fetchOwner();
			const roleCreatedEmbed = new EmbedBuilder()
				.setTitle('Role created')
				.setColor('Blurple')
				.setDescription('The role **Ticket Manager** was created. Give it to the members who need to see tickets.\n**⚠️ Please do not change his name**')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			await interaction.guild.roles.create({
				name: 'Ticket Manager',
			}).then(() => {
				owner.send({
					embeds: [roleCreatedEmbed],
				});
			});
		}

		const ticketmanager = await interaction.member.roles.cache.find(role => role.name === 'Ticket Manager');

		if (interaction.customId === 'closeWithReason') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
				const confirmationEmbed = new EmbedBuilder()
					.setTitle('Close ticket confirmation')
					.setDescription('Do you really want to close the ticket ?')
					.setColor('Blurple')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

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
			else {
				const noPermissionEmbed = new EmbedBuilder()
					.setTitle('Permission denied')
					.setDescription(`You don't have the permission to use this button \n> - You dont have the permission \`ManageChannels\`\n> - You don't have the role ${interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`)
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

		if (interaction.customId === 'closeWithReasonConfirmation') {
			if (!interaction.memberPermissions.has('ManageChannels') || !interaction.memberPermissions.has('Administrator') || !ticketmanager) {
				const noPermissionEmbed = new EmbedBuilder()
					.setTitle('Permission denied')
					.setDescription(`You don't have the permission to use this button \n> - You dont have the permission \`ManageChannels\`\n> - You don't have the role ${interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`)
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}

			const modal = new ModalBuilder()
				.setCustomId('reason')
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