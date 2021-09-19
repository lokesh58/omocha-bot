import BotCommand from '../../bot-command';

const command: BotCommand = {
  data: {
    name: 'ping',
    description: 'Replies with pong.',
  },
  handler: async (interaction) => {
    await interaction.followUp({
      content: 'Pong!',
    });
  },
};

export default command;
