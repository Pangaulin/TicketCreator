// eslint-disable-next-line no-unused-vars
const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Allow staff to clear channels or tickets')
		.addSubcommand(subcommand =>
			subcommand.setName('ticket')
				.setDescription('Allows to clear all the ticket'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('messages')
				.setDescription('Allows to bulk delete messages in a channel (maximum : 99)')
				.addNumberOption(option =>
					option.setName('number')
						.setDescription('How much messages do you want to delete ?')
						.setMinValue(1)
						.setMaxValue(99)
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('allchannel')
				.setDescription('Allows to clear the entire channel'),
		),
	/**
		 * @param { CommandInteraction } interaction
		 */
	async execute(interaction) {
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

		if (interaction.options.getSubcommand() === 'ticket') {
			const ticketmanager = await interaction.member.roles.cache.find(role => role.name === 'Ticket Manager');

			if (!ticketmanager) {
				if (!interaction.memberPermissions.has('ManageMessages')) {
					const noPermissionEmbed = new EmbedBuilder()
						.setTitle('Permission denied')
						.setDescription(`You don't have the permission to use this command \n> - You dont have the permission \`ManageMessages\`\n> - You don't have the role ${interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`)
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [noPermissionEmbed],
						ephemeral: true,
					});
				}
			}

			if (!interaction.channel.name.startsWith('ticket')) {
				const embed = new EmbedBuilder()
					.setTitle('You can\'t do that')
					.setDescription('You can\'t use this command, because you are not in a ticket\nInstead, use the `/clear messages` or `/clear allchannel` command')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			else {
				interaction.channel.clone().then((channel) => {
					interaction.channel.delete();
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

					const ticketEmbed = new EmbedBuilder()
						.setTitle('Here is your ticket !')
						.setColor('Blurple')
						.setDescription('> Thank you for contacting support.\n> Please describe your issue and wait for a response.')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					const answerEmbed = new EmbedBuilder()
						.setTitle('The ticket was cleared')
						.setDescription(`The entire ticket has been sucessfully cleared by ${interaction.member}`)
						.setColor('Green')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					channel.send({
						content: `${interaction.member}`,
					}).then(message => {
						message.delete();
					});

					channel.send({
						embeds: [ticketEmbed],
						components: [row],
					});

					channel.send({
						embeds: [answerEmbed],
					});
				});
			}
		}

		if (!interaction.memberPermissions.has('ManageMessages')) {
			const noPermissionEmbed = new EmbedBuilder()
				.setTitle('Permission denied')
				.setDescription('You don\'t have the permission to use this command \n> - You dont have the permission `ManageMessages`')
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			return interaction.reply({
				embeds: [noPermissionEmbed],
				ephemeral: true,
			});
		}

		if (interaction.options.getSubcommand() === 'messages') {
			interaction.channel.bulkDelete(interaction.options.getNumber('number'), true).then((messages) => {
				if (messages.size === 1) {
					const answerEmbed = new EmbedBuilder()
						.setTitle('The message was cleared')
						.setDescription(`One message has been cleared by ${interaction.member}\n> Messages who are 14 days old and more won't be deleted`)
						.setColor('Green')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [answerEmbed],
					}).then((message) => {
						setTimeout(() => message.delete(), 5000);
					});
				}

				else {
					const answerEmbed = new EmbedBuilder()
						.setTitle('The messages were cleared')
						.setDescription(`${messages.size} messages were cleared by ${interaction.member}\n> Messages who are 14 days old and more won't be deleted`)
						.setColor('Green')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [answerEmbed],
					}).then((message) => {
						setTimeout(() => message.delete(), 5000);
					});
				}
			});
		}

		if (interaction.options.getSubcommand() === 'allchannel') {
			if (interaction.channel.name.startsWith('ticket')) {
				const answerEmbed = new EmbedBuilder()
					.setTitle('I can\'t clear this channel')
					.setColor('Red')
					.setDescription('This channel is a ticket, so I can\'t delete it\n> Instead use the `/clear ticket` command')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				return interaction.reply({
					embeds: [answerEmbed],
				});
			}

			await interaction.channel.clone().then((channel) => {
				interaction.channel.delete().catch((err) => {
					channel.delete();
					const errorEmbed = new EmbedBuilder()
						.setTitle('I can\'t clear all this channel')
						.setDescription(`I need to delete this channel to clear it, but an error has occured :\n> ${err.rawError.message}`)
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [errorEmbed],
					});
				});

				const answerEmbed = new EmbedBuilder()
					.setTitle('The channel was cleared')
					.setDescription(`The entire channel has been sucessfully cleared by ${interaction.member}`)
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				channel.send({
					embeds: [answerEmbed],
				}).catch(() => {
					return;
				});

				channel.send(`${interaction.member}`).then((message) => {
					message.delete();
				}).catch(() => {
					return;
				});
			});
		}
	},
};