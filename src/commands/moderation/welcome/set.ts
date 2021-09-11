import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the welcome message or welcome channel for the server.',
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'message',
        description: 'The welcome message for the server. Use `<@>` to mention the new member.',
        type: 'STRING',
        required: false,
      },
      {
        name: 'channel',
        description: 'The bot\'s welcome channel for the server.',
        type: 'CHANNEL',
        required: false,
      }
    ],
  },
  handler: (interaction) => {
    // TODO
  },
} as BotSubCommand;
