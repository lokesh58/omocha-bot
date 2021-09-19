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
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    try {
      await interaction.deferReply({ ephemeral: true });
      const cmd = interaction.command;
      if (!cmd) {
        throw new Error('No command in commandInteraction!');
      }
      const handler = handlers.get(cmd.name);
      if (!handler) {
        throw new Error(`Unknown command <${cmd.id}, ${cmd.name}> recieved!`);
      }
      await handler(interaction);
    } catch (err) {
      onError(err);
      await interaction.followUp({
        content: 'An error occurred! Please try again.',
        ephemeral: true,
      });
    }
  });
};

export default startCommandHandling;
