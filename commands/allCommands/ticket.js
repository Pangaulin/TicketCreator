// eslint-disable-next-line no-unused-vars
const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Allow to manage the ticket')
		.addSubcommand(subcommand =>
			subcommand.setName('close')
				.setDescription('Allows to close the ticket without use the button')
				.addBooleanOption((option) =>
					option.setName('reason')
						.setDescription('Do you wan\'t to specify a reason ?')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('closerequest')
				.setDescription('Allows to ask if the ticket can be closed to the ticket creator'),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('notes')
				.setDescription('Create a separate thread, who can only be viewed by support'))
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Allows to add a member in the current ticket')
				.addUserOption((option) =>
					option.setName('member')
						.setDescription('Choose the member who will be added in the ticket')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Allows to remove a member in the current ticket')
				.addUserOption((option) =>
					option.setName('member')
						.setDescription('Choose the member who will be removed in the ticket')
						.setRequired(true),
				),
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

		const ticketmanager = await interaction.member.roles.cache.find(role => role.name === 'Ticket Manager');

		if (!interaction.channel.name.startsWith('ticket')) {
			const notATicketEmbed = new EmbedBuilder()
				.setTitle('This is not a ticket')
				.setDescription('This channel is not a ticket')
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			return interaction.reply({
				embeds: [notATicketEmbed],
				ephemeral: true,
			});
		}

		if (!interaction.memberPermissions.has('ManageChannels') || !interaction.memberPermissions.has('Administrator') || !ticketmanager) {
			const noPermissionEmbed = new EmbedBuilder()
				.setTitle('Permission denied')
				.setDescription(`You don't have the permission to use this command \n> - You dont have the permission \`ManageChannels\`\n> - You don't have the role ${interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`)
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			return interaction.reply({
				embeds: [noPermissionEmbed],
				ephemeral: true,
			});
		}

		const reason = interaction.options.getBoolean('reason');

		if (interaction.options.getSubcommand() === 'close') {
			if (reason === false) {
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
			if (reason === true) {
				const confirmationEmbed = new EmbedBuilder()
					.setTitle('Close ticket confirmation')
					.setDescription('Do you really want to close the ticket ?')
					.setColor('Blurple')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				const closeConfirmationButton = new ButtonBuilder()
					.setCustomId('closeWithReasonConfirmation')
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
		}


		if (interaction.options.getSubcommand() === 'closerequest') {
			const memberCloseConfirmation = new ButtonBuilder()
				.setCustomId('memberCloseConfirmation')
				.setEmoji('✔️')
				.setLabel('Close the ticket')
				.setStyle(ButtonStyle.Secondary);

			const row = new ActionRowBuilder()
				.addComponents(memberCloseConfirmation);

			const channelName = interaction.channel.name;
			const ticketCreatorUsername = channelName.substr(7);
			const ticketCreator = (await interaction.guild.members.search({ query: ticketCreatorUsername })).first();

			const answerEmbed = new EmbedBuilder()
				.setTitle('Can the ticket be closed ?')
				.setDescription(`A close request has been requested by ${interaction.member}\n> Only the **initial** ticket creator can use this button`)
				.setColor('Blurple')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			interaction.channel.send({
				content: `${ticketCreator}`,
			}).then((message) => {
				message.delete();
			});

			return interaction.reply({
				embeds: [answerEmbed],
				components: [row],
			});

		}

		if (interaction.options.getSubcommand() === 'notes') {
			if (interaction.memberPermissions.has('ManageChannels') || interaction.memberPermissions.has('Administrator') || ticketmanager) {
				const notes = await interaction.channel.threads.create({
					name: 'notes',
					reason: 'The user asked a separate thread for notes',
					type: ChannelType.PrivateThread,
				});

				notes.send(`${await interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')}`).then((message) => {
					message.delete();
				});

				const answerEmbed = new EmbedBuilder()
					.setTitle('The thread was created')
					.setDescription(`The thread ${notes} has been sucessfully created`)
					.setColor('Green')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				interaction.reply({
					embeds: [answerEmbed],
				});

			}
		}

		if (interaction.options.getSubcommand() === 'add') {
			const member = interaction.options.getMember('member');
			if (interaction.channel.name.startsWith('ticket-')) {
				if (member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ViewChannel)) {
					const alreadyInChannel = new EmbedBuilder()
						.setTitle('I can\'t do that')
						.setDescription(`The user ${member} is already in this channel`)
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [alreadyInChannel],
					});
				}

				await interaction.channel.permissionOverwrites.edit(await interaction.guild.roles.everyone.id, {
					ViewChannel: false,
					SendMessages: true,
				});

				await interaction.channel.permissionOverwrites.edit(member.id, {
					ViewChannel: true,
				}).then(() => {

					const embed = new EmbedBuilder()
						.setTitle('Member added')
						.setDescription(`The member ${member} were successfully added in this channel !`)
						.setColor('Green')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [embed],
					});
				});
			}
			else {
				const notATicketEmbed = new EmbedBuilder()
					.setTitle('This is not a ticket')
					.setDescription('This channel is not a ticket')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				interaction.reply({
					embeds: [notATicketEmbed],
					ephemeral: true,
				});
			}
		}

		if (interaction.options.getSubcommand() === 'remove') {
			const member = interaction.options.getMember('member');
			if (interaction.channel.name.includes('ticket-')) {
				if (!member.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ViewChannel)) {
					const notInChannel = new EmbedBuilder()
						.setTitle('I can\'t do that')
						.setDescription(`The user ${member} is not in this channel`)
						.setColor('Red')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [notInChannel],
					});
				}

				await interaction.channel.permissionOverwrites.edit(member.id, {
					ViewChannel: false,
				}).then(() => {

					const embed = new EmbedBuilder()
						.setTitle('Member added')
						.setDescription(`The member ${member} were successfully removed from this channel !`)
						.setColor('Green')
						.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

					return interaction.reply({
						embeds: [embed],
					});
				});
			}
			else {
				const notATicketEmbed = new EmbedBuilder()
					.setTitle('This is not a ticket')
					.setDescription('This channel is not a ticket')
					.setColor('Red')
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

				interaction.reply({
					embeds: [notATicketEmbed],
					ephemeral: true,
				});
			}
		}

	},
};