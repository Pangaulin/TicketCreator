// eslint-disable-next-line no-unused-vars
const { CommandInteraction, SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Add a member in the current ticket')
		.addUserOption(option =>
			option.setName('member')
				.setDescription('Choose the member who will be added in the ticket')
				.setRequired(true)),
	/**
		 * @param {CommandInteraction} interaction
		 */
	async execute(interaction) {
		const member = interaction.options.getMember('member');

		if (!interaction.guild.roles.cache.find(role => role.name === 'Ticket Manager')) {
			const owner = await interaction.guild.fetchOwner();
			await interaction.guild.roles.create({
				name: 'Ticket Manager',
			}).then(() => {
				owner.send({
					content: 'The role **Ticket Manager** was created. Give it to the members who need to see tickets.\n**⚠️ Please do not change his name**',
				});
			});
		}

		if (interaction.member.id !== interaction.guild.ownerId || !interaction.memberPermissions.has('Administrator') || !interaction.memberPermissions.has('ManageChannels')) {
			const noPermissionEmbed = new EmbedBuilder()
				.setTitle('Permission denied')
				.setDescription('You don\'t have the permission to use this command `Permission missing : ManageChannels`\n**People who have the role "Ticket Manager" can manage tickets**')
				.setColor('Red')
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			return interaction.reply({
				embeds: [noPermissionEmbed],
				ephemeral: true,
			});
		}
		else if (interaction.channel.name.includes('ticket-')) {
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
					.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

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
				.setFooter({ iconURL: interaction.client.user.displayAvatarURL({}), text: 'Powered by Ticket Creator' });

			interaction.reply({
				embeds: [notATicketEmbed],
				ephemeral: true,
			});
		}
	},
};