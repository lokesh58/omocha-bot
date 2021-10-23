import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../../bot';

export default {
  name: 'ping',
  description: 'Replies with pong and websocket ping details.',
  handler: async (interaction) => {
    const { client: { ws } } = interaction;
    await interaction.reply({
      content: 'Pong!',
      embeds: [
        new MessageEmbed()
          .setDescription(`Websocket Ping: ${ws.ping}ms`),
      ],
    });
  },
} as BotCommand;
