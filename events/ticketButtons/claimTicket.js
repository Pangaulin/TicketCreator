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

		if (interaction.customId === 'claim') {
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

			const claimEmbed = new EmbedBuilder()
				.setTitle('The ticket has been claimed')
				.setDescription(`${interaction.member} will be in charge of your ticket\n> If you added third party members with the /add command, you need to add them an other time`)
				.setColor('Green')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			const channelName = interaction.channel.name;
			const ticketCreatorUsername = channelName.substr(7);
			const ticketCreator = (await interaction.guild.members.search({ query: ticketCreatorUsername })).first();

			try {
				interaction.channel.permissionOverwrites.set([
					{
						id: ticketmanager.id,
						deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					},
					{
						id: interaction.guild.id,
						deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					},
					{
						id: interaction.member.id,
						allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					},
					{
						id: ticketCreator.user.id,
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

			return interaction.channel.send({
				embeds: [claimEmbed],
			});

		}
	},
};