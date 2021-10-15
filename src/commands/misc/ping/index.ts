import { MessageEmbed } from 'discord.js';
import BotCommand from '../../bot-command';

const command: BotCommand = {
  data: {
    name: 'ping',
    description: 'Replies with pong and websocket ping details.',
  },
  handler: async (interaction) => {
    const { client: { ws } } = interaction;
    await interaction.reply({
      content: 'Pong!',
      embeds: [
        new MessageEmbed()
          .setDescription(`Websocket Ping: ${ws.ping}ms`)
      ]
    });
  },
};

export default command;
