import { GuildMember, MessageSelectMenu } from 'discord.js';
import { BotEvent } from '../../bot';
import { getSuccessEmbed, onError, getErrorEmbed } from '../../utils';

export default {
  name: 'role-select-menu',
  starter: (client) => {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.inGuild() || !interaction.isSelectMenu() || !(interaction.customId === 'role_select_menu')) {
        return;
      }
      try {
        const {
          values: selectedRoles, member: iMember, guildId, user, 
        } = interaction;
        const component = interaction.component as MessageSelectMenu;
        const unselectedRoles = component.options.filter(o => !selectedRoles.includes(o.value)).map(o => o.value);
        await interaction.deferReply({ ephemeral: true });
        const member = iMember instanceof GuildMember ? iMember : await (await client.guilds.fetch(guildId)).members.fetch(user);
        await Promise.all([
          ...selectedRoles.map(id => member.roles.add(id)),
          ...unselectedRoles.map(id => member.roles.remove(id)),
        ]);
        await interaction.editReply({
          embeds: [getSuccessEmbed('Roles updated successfully!')],
        });
      } catch (err) {
        onError(err);
        await interaction.followUp({
          embeds: [getErrorEmbed('Some error occurred while updating roles. Some roles may not be updated.')],
          ephemeral: true,
        }).catch(onError);
      }
    });
  },
} as BotEvent;
