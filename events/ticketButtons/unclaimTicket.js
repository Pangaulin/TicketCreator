// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, EmbedBuilder, PermissionsBitField, ButtonStyle, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
	 * @param { ButtonInteraction } interaction
	 */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId === 'unclaim') {
			if (await !interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
				const notTicketOwner = new EmbedBuilder()
					.setTitle('You can\'t do this')
					.setDescription('You don\'t have the permission to unclaim the ticket because :\n> - You don\'t have the permission to `ManageChannels`')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [notTicketOwner],
					ephemeral: true,
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

			const claim = new ButtonBuilder()
				.setCustomId('claim')
				.setLabel('Claim the ticket')
				.setEmoji('🙋‍♂️')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder()
				.addComponents(close, closeWithReason, claim);

			if (await interaction.channel.permissionsFor(interaction.guild.id).has(PermissionsBitField.Flags.SendMessages)) {
				const alreadyClaimed = new EmbedBuilder()
					.setTitle('The embed isn\'t claimed')
					.setDescription('@everyone already have the permission to write in this ticket')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				await interaction.update({
					components: [row],
				});

				return interaction.followUp({
					embeds: [alreadyClaimed],
				});
			}
			else {
				interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
					SendMessages: true,
				});


				const unclaimedEmbed = new EmbedBuilder()
					.setTitle('Ticket claimed !')
					.setDescription(`The ticket has been unclaimed by ${interaction.member}`)
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				await interaction.update({
					components: [row],
				}).then(() => {
					interaction.followUp({
						embeds: [unclaimedEmbed],
					});
				});
			}
		}
	},
};
