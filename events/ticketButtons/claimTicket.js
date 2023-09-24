// eslint-disable-next-line no-unused-vars
const { ButtonInteraction, Events, EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param { ButtonInteraction } interaction
     */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'claim') {
			const claimEmbed = new EmbedBuilder()
				.setTitle('Ticket claimed !')
				.setDescription(`The ticket has been claimed by ${interaction.member}`)
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			const channelName = interaction.channel.name;
			const ticketOwner = channelName.substr(7);

			if (interaction.member.user.username.toLowerCase() !== ticketOwner) {
				if (await !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
					const notTicketOwner = new EmbedBuilder()
						.setTitle('You can\'t do this')
						.setDescription('You don\'t have the permission to claim the ticket because :\n> - You are not the initial creator\n> - You don\'t have the permission to `ManageChannels`')
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

					return interaction.reply({
						embeds: [notTicketOwner],
						ephemeral: true,
					});
				}
			}

			if (await !interaction.channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages)) {
				const alreadyClaimed = new EmbedBuilder()
					.setTitle('The embed is claimed')
					.setDescription('The embed was already claimed !')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });
				return interaction.reply({
					embeds: [alreadyClaimed],
				});
			}

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

			const unclaimButton = new ButtonBuilder()
				.setCustomId('unclaim')
				.setLabel('Unclaim the ticket')
				.setEmoji('🔓')
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder()
				.addComponents(close, closeWithReason, unclaimButton);

			await interaction.update({
				components: [row],
			});

			return interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
				ViewChannel: false,
				SendMessages: false,
			}).then(async () => {
				await interaction.followUp({
					embeds: [claimEmbed],
				});
			});
		}
	},
};