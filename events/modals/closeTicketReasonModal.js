// eslint-disable-next-line no-unused-vars
const { Events, ModalSubmitInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
	 *
	 * @param {ModalSubmitInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.isModalSubmit()) {
			return;
		}

		if (interaction.customId === 'reason') {
			const reason = interaction.fields.getTextInputValue('reason');

			const channelName = interaction.channel.name;
			const ticketOwner = channelName.substr(7);
			const ticketOwnerObject = (await interaction.guild.members.search({ query: ticketOwner })).first();
			const currentTime = Math.floor(Date.now() / 1000);
			const ticketCreationTime = Math.floor(interaction.channel.createdAt / 1000);

			const userEmbed = new EmbedBuilder()
				.setTitle('Your ticket is closed')
				.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: false }) })
				.addFields(
					{ name: `Ticket ID`, value: `${Math.round(Math.random() * 9999)}`, inline: true },
					{ name: `Opened by`, value: `<@${ticketOwnerObject.id}>`, inline: true },
					{ name: `Closed by`, value: `<@${interaction.member.id}>`, inline: true },
					{ name: 'Created time :', value: `<t:${ticketCreationTime}:f>`, inline: true },
					{ name: 'Closed time :', value: `<t:${currentTime}:f>`, inline: true },
					{ name: `Reason`, value: `${reason}` },
				)
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			const timerEmbed = new EmbedBuilder()
				.setTitle('Thank you for using our service !')
				.setDescription('The ticket will be deleted in 5 seconds')
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			await interaction.reply({
				embeds: [timerEmbed],
			});

			const delay = ms => new Promise(res => setTimeout(res, ms));

			await delay(5000).then(() => {
				try {
					interaction.channel.delete();
				}
				catch (err) {
					const errorEmbed = new EmbedBuilder()
						.setTitle('An error has occurred')
						.setDescription('An error has occurred when I tried to close the ticket')
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [errorEmbed],
					});
				}

				return ticketOwnerObject.send({
					embeds: [userEmbed],
				});
			});
		}
	},

};
