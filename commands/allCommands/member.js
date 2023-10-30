// eslint-disable-next-line no-unused-vars
const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('members')
		.setDescription('Allow to manage members in the tickets')
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

		if (interaction.member.id !== interaction.guild.ownerId || !interaction.memberPermissions.has('Administrator') || !interaction.memberPermissions.has('ManageChannels')) {
			const noPermissionEmbed = new EmbedBuilder()
				.setTitle('Permission denied')
				.setDescription('You don\'t have the permission to use this command `Permission missing : ManageChannels`\n**People who have the role "Ticket Manager" can manage tickets**')
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Easy Ticket' });

			return interaction.reply({
				embeds: [noPermissionEmbed],
				ephemeral: true,
			});
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

				await interaction.channel.permissionOverwrites.set([
					{
						id: member.id,
						allow: [PermissionsBitField.Flags.ViewChannel],
					},
				]).then(() => {

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

		else if (interaction.options.getSubcommand() === 'remove') {
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

				await interaction.channel.permissionOverwrites.set([
					{
						id: member.id,
						deny: [PermissionsBitField.Flags.ViewChannel],
					},
				]).then(() => {

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