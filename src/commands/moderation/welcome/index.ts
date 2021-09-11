import BotCommand from '../../bot-command';
import getCmd from './get';
import setCmd from './set';
import deleteCmd from './delete';

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
    const subCmdName = interaction.options.getSubcommand(true);
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
