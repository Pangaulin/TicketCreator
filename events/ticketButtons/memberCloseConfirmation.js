// eslint-disable-next-line no-unused-vars
const { ButtonInteraction, Events, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	/**
     * @param {ButtonInteraction} interaction
     */
	async execute(interaction) {
		if (!interaction.isButton()) {
			return;
		}

		if (interaction.customId == 'memberCloseConfirmation') {
			const channelName = interaction.channel.name;
			const ticketOwnerUsername = channelName.substr(7);
			const ticketOwner = (await interaction.guild.members.search({ query: ticketOwnerUsername })).first();

			if (interaction.user.username === ticketOwnerUsername) {
				const timerEmbed = new EmbedBuilder()
					.setTitle('Thank you for using our service !')
					.setDescription('The ticket will be deleted in 5 seconds')
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				const currentTime = Math.floor(Date.now() / 1000);
				const ticketCreationTime = Math.floor(interaction.channel.createdAt / 1000);

				const userEmbed = new EmbedBuilder()
					.setTitle('Your ticket is closed')
					.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: false }) })
					.addFields(
						{ name: `${interaction.guild.emojis.cache.get('1155456487641067520')} Ticket ID`, value: `${Math.round(Math.random() * 9999)}`, inline: true },
						{ name: `${interaction.guild.emojis.cache.get('1155456490040205372')} Opened by`, value: `<@${ticketOwner.id}>`, inline: true },
						{ name: `${interaction.guild.emojis.cache.get('1155456484986081370')} Closed by`, value: `<@${interaction.member.id}> (with a close request made by staff)`, inline: true },
						{ name: ':clock1130: Created time :', value: `<t:${ticketCreationTime}:f>`, inline: true },
						{ name: ':clock4: Closed time :', value: `<t:${currentTime}:f>`, inline: true },
						{ name: `${interaction.guild.emojis.cache.get('1155456482880540752')} Reason`, value: 'No reason provided' },
					)
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
							.setDescription('An error has occurred when I tryed to close the ticket')
							.setColor('Red')
							.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

						return interaction.reply({
							embeds: [errorEmbed],
						});
					}

					return ticketOwner.send({
						embeds: [userEmbed],
					});
				});
			}
			else {
				return;
			}

		}
	},
};