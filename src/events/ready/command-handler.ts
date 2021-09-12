import { Client, Collection, InteractionReplyOptions } from 'discord.js';
import commands from '../../commands';
import { CommandHandler } from '../../commands/bot-command';
import { onError } from '../../utils';

const startCommandHandling = (client: Client): void => {
  const handlers = new Collection<string, CommandHandler>();
  commands.forEach((cmd) => {
    cmd.once && cmd.once(client);
    handlers.set(cmd.data.name, cmd.handler);
  });
  client.on('interactionCreate', (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    const cmd = interaction.command;
    try {
      if (!cmd) {
        throw new Error('No command in commandInteraction!');
      }
      const handler = handlers.get(cmd.name);
      if (!handler) {
        throw new Error(`Unknown command <${cmd.id}, ${cmd.name}> recieved!`);
      }
      handler(interaction);
    } catch (err) {
      const msg: InteractionReplyOptions = {
        content: 'An error occurred! Please try again.',
        ephemeral: true,
      };
      if (interaction.replied) {
        interaction.editReply(msg);
      } else {
        interaction.reply(msg);
      }
      onError(err);
    }
  });
};

export default startCommandHandling;
