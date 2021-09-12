import BotCommand from '../../bot-command';
import getCmd from './get';
import setCmd from './set';
import deleteCmd from './delete';
import { guildOnlyError } from '../../../utils/constants';
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
  handler: (interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply(guildOnlyError);
      return;
    }
    const { member, options } = interaction;
    if (!(member instanceof GuildMember)) {
      throw new Error('member is not instance of GuildMember!');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
      interaction.reply({
        content: 'You need permission to manage the server to use this command!',
        ephemeral: true,
      });
    }
    const subCmdName = options.getSubcommand(true);
    switch(subCmdName) {
    case getCmd.data.name:
      getCmd.handler(interaction);
      break;
    case setCmd.data.name:
      setCmd.handler(interaction);
      break;
    case deleteCmd.data.name:
      deleteCmd.handler(interaction);
      break;
    default:
      throw new Error(`Invalid Sub Command ${subCmdName} recieved!`);
    }
  },
} as BotCommand;
