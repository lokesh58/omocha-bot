import BotCommand from '../../bot-command';
import getCmd from './get';
import setCmd from './set';
import deleteCmd from './delete';
import { guildOnlyError } from '../../../utils/constants';
import { GuildMember } from 'discord.js';

export default {
  data: {
    name: 'leaving',
    description: 'Get or edit the leaving message or leaving channel for the server.',
    options: [
      getCmd.data,
      setCmd.data,
      deleteCmd.data,
    ],
  },
  handler: async (interaction) => {
    if (!interaction.inGuild()) {
      await interaction.reply(guildOnlyError);
      return;
    }
    const { member, options } = interaction;
    if (!(member instanceof GuildMember)) {
      throw new Error('member is not instance of GuildMember!');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
      await interaction.reply({
        content: 'You need `MANAGE_GUILD` permission to use this command!',
        ephemeral: true,
      });
      return;
    }
    const subCmdName = options.getSubcommand(true);
    switch(subCmdName) {
    case getCmd.data.name:
      return getCmd.handler(interaction);
    case setCmd.data.name:
      return setCmd.handler(interaction);
    case deleteCmd.data.name:
      return deleteCmd.handler(interaction);
    default:
      throw new Error(`Invalid Sub Command ${subCmdName} recieved!`);
    }
  },
} as BotCommand;
