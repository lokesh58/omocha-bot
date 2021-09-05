import { Client, Collection } from 'discord.js';
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
      onError(err);
    }
  });
};

export default startCommandHandling;
