// eslint-disable-next-line no-unused-vars
const { ButtonBuilder, SlashCommandBuilder, CommandInteraction, EmbedBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Allows you to setup the ticket system in a channel')
		.addBooleanOption(option => option.setName('embed')
			.setDescription('Will the message be an embed message ?')
			.setRequired(true))
		.addStringOption(option => option.setName('message')
			.setDescription('Write the message who will be used to create a ticket, or the embed description')
			.setRequired(true))
		.addStringOption(option => option.setName('button')
			.setDescription('Write the name of the button')
			.setRequired(true))
		.addStringOption(option => option.setName('title')
			.setDescription('Write the title of the embed (this is required if you use one)')
			.setRequired(false))
		.addStringOption(option => option.setName('color')
			.setDescription('Select a color for the embed (example : #FFFFFF)')
			.setRequired(false)),
	/**
         * @param { CommandInteraction } interaction
         */
	async execute(interaction) {

		if (!interaction.memberPermissions.has('Administrator') || !interaction.memberPermissions.has('ManageGuild')) {
			const noPermissionEmbed = new EmbedBuilder()
				.setTitle('Permission denied')
				.setDescription('You don\'t have the permission to use this button `Permission missing : ManageGuild or Administrator`')
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			return interaction.reply({
				embeds: [noPermissionEmbed],
				ephemeral: true,
			});
		}

		const isEmbed = interaction.options.getBoolean('embed');
		const message = interaction.options.getString('message');
		const title = interaction.options.getString('title');
		const color = interaction.options.getString('color');
		const buttonName = interaction.options.getString('button');

		const button = new ButtonBuilder()
			.setCustomId('open')
			.setLabel(buttonName)
			.setEmoji('🎫')
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder()
			.addComponents(button);

		if (isEmbed == true) {
			if (!title) {
				return interaction.reply({
					content: 'A title is required when you use an embed !',
					ephemeral: true,
				});
			}
			if (!color) {
				const embed = new EmbedBuilder()
					.setTitle(title)
					.setDescription(message)
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

				interaction.channel.send({
					embeds: [embed],
					components: [row],
				});

				return interaction.reply({
					content: 'The message has been setup in this channel',
				});
			}
			else {
				const colorRegex = /^#([0-9a-f]{3}){1,2}$/i;

				if (!colorRegex.test(color)) {
					return interaction.reply({
						content: 'This color isn\'t valid (example of valid color : #FFFFFF)',
						ephemeral: true,
					});
				}
				else {
					const embed = new EmbedBuilder()
						.setTitle(title)
						.setDescription(message)
						.setColor(color)
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

					interaction.channel.send({
						embeds: [embed],
						components: [row],
					});

					return interaction.reply({
						content: 'The message has been setup in this channel (you can delete this message)',
					});
				}
			}
		}
		else {
			interaction.channel.send({
				content: message,
				components: [row],
			});

			return interaction.reply({
				content: 'The message has been setup in this channel (you can delete this message)',
			});
		}
	},
};