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

			const ticketmanager = interaction.guild.roles.cache.find((role) => role.name === 'Ticket Manager');

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

			const channelName = interaction.channel.name;
			const ticketCreatorUsername = channelName.substr(7);
			const ticketCreator = (await interaction.guild.members.search({ query: ticketCreatorUsername })).first();

			try {
				interaction.channel.permissionOverwrites.set([
					{
						id: ticketmanager.id,
						allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					},
					{
						id: interaction.guild.id,
						allow: [PermissionsBitField.Flags.SendMessages],
						deny: [PermissionsBitField.Flags.ViewChannel],
					},
					{
						id: ticketCreator.id,
						allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					},
				]);
			}
			catch (err) {
				const errEmbed = new EmbedBuilder()
					.setTitle('An error has occurred')
					.setDescription('An error has occurred while claiming the ticket.\n> Tip : Look if the username on the name of the ticket is same as initial creator username')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });
				console.log(err);
				return interaction.reply({
					embeds: [errEmbed],
				});
			}

			const unclaimEmbed = new EmbedBuilder()
				.setTitle('The ticket has been unclaimed')
				.setDescription(`${interaction.member} has unclaimed the ticket`)
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			interaction.update({
				components: [row],
			});

			return interaction.channel.send({
				embeds: [unclaimEmbed],
			});
		}
	},
};
