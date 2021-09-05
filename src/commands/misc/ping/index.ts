import { onError } from '../../../utils';
import BotCommand from '../../bot-command';

const command: BotCommand = {
  data: {
    name: 'ping',
    description: 'Replies with pong.',
  },
  handler: (interaction) => {
    interaction.reply({
      content: 'Pong!',
      ephemeral: true,
    }).catch(onError);
  },
};

export default command;
