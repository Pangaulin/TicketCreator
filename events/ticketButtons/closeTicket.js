// eslint-disable-next-line no-unused-vars
const { Events, ButtonInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

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

		if (interaction.customId === 'close') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
				const confirmationEmbed = new EmbedBuilder()
					.setTitle('Close ticket confirmation')
					.setDescription('Do you really want to close the ticket ?')
					.setColor('Blurple')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

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
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

		if (interaction.customId === 'closeWithReasonConfirmation') {
			return;
		}

		if (interaction.customId === 'closeConfirmation') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
				const timerEmbed = new EmbedBuilder()
					.setTitle('Thank you for using our service !')
					.setDescription('The ticket will be deleted in 5 seconds')
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				const channelName = interaction.channel.name;
				const ticketOwner = channelName.substr(7);
				const ticketOwnerObject = (await interaction.guild.members.search({ query: ticketOwner })).first();
				const currentTime = Math.floor(Date.now() / 1000);
				const ticketCreationTime = Math.floor(interaction.channel.createdAt / 1000);

				let ticketTextOwner;

				if (ticketOwnerObject == undefined) {
					ticketTextOwner = 'undefined';
				}
				else {
					ticketTextOwner = `<@${ticketOwnerObject.id}>`;
				}

				const userEmbed = new EmbedBuilder()
					.setTitle('Your ticket is closed')
					.setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ forceStatic: false }) })
					.addFields(
						{ name: `${interaction.guild.emojis.cache.get('1155456487641067520')} Ticket ID`, value: `${Math.round(Math.random() * 9999)}`, inline: true },
						{ name: `${interaction.guild.emojis.cache.get('1155456490040205372')} Opened by`, value: `${ticketTextOwner}`, inline: true },
						{ name: `${interaction.guild.emojis.cache.get('1155456484986081370')} Closed by`, value: `<@${interaction.member.id}>`, inline: true },
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

					try {
						return ticketOwnerObject.send({
							embeds: [userEmbed],
						});
					}
					catch {
						return;
					}
				});
			}
			else {
				const noPermissionEmbed = new EmbedBuilder()
					.setTitle('Permission denied')
					.setDescription('You don\'t have the permission to use this button `Permission missing : ManageChannels`')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [noPermissionEmbed],
					ephemeral: true,
				});
			}
		}

	},
};