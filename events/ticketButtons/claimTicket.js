// eslint-disable-next-line no-unused-vars
const { ButtonInteraction, Events, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
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

			if (interaction.member.user.username !== ticketOwner) {
				const notTicketOwner = new EmbedBuilder()
					.setTitle('You can\'t do this')
					.setDescription('You don\'t have the permission to claim the ticket because you aren\'t the initial creator')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				return interaction.reply({
					embeds: [notTicketOwner],
				});
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

			return interaction.channel.permissionOverwrites.edit(interaction.guild.id, {
				ViewChannel: false,
				SendMessages: false,
			}).then(() => {
				interaction.reply({
					embeds: [claimEmbed],
				});
			});

		}
	},
};