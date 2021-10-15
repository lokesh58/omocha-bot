import BotCommand from '../../bot-command';
import getCmd from './get';
import setCmd from './set';
import deleteCmd from './delete';
import { guildOnlyError, permissionError } from '../../command-utils/constants';
import { GuildMember } from 'discord.js';

export default {
  data: {
    name: 'welcome',
    description: 'Get or edit the welcome message or welcome channel for the server.',
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
    if (!(member as GuildMember).permissions.has('MANAGE_GUILD')) {
      await interaction.reply(permissionError(['MANAGE_GUILD']));
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
