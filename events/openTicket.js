// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
     */
	execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'open') {

			const close = new ButtonBuilder()
				.setCustomId('close')
				.setLabel('Close')
				.setEmoji('🔒')
				.setStyle(ButtonStyle.Danger);

			const closeWithReason = new ButtonBuilder()
				.setCustomId('closeWithReason')
				.setLabel('Close With Reason')
				.setEmoji('🔏')
				.setStyle(ButtonStyle.Danger);

			const claim = new ButtonBuilder()
				.setCustomId('claim')
				.setLabel('Claim the ticket')
				.setEmoji('🙋‍♂️')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(close, closeWithReason, claim);

			interaction.guild.channels.create({
				name: `ticket-${interaction.user.username}`,
				type: ChannelType.GuildText,
				permissionOverwrites: [
					{
						id: interaction.client.user.id,
						allow: ['ViewChannel', 'ManageChannels'],
					},
					{
						id: interaction.user.id,
						allow: ['ViewChannel', 'SendMessages'],
					},
				],
			}).then(channel => {

				const answerEmbed = new EmbedBuilder()
					.setTitle('Here is your ticket !')
					.setColor('Blurple')
					.setDescription('> Thank you for contacting support.\n> Please describe your issue and wait for a response.')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });
				channel.send({
					content: `${interaction.member}`,
				}).then(message => {
					message.delete();
				});

				channel.send({
					embeds: [answerEmbed],
					components: [row],
				});

				return interaction.reply({
					content: `The channel ${channel} has been created`,
					ephemeral: true,
				});
			});
		}
	},
};