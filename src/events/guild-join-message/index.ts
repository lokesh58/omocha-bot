import { MessageEmbed } from 'discord.js';
import { onError } from '../../utils';
import BotEvent from '../bot-event';

const event: BotEvent = (client) => {
  client.on('guildCreate', async (guild) => {
    try{
      const { systemChannel } = guild;
      if (!systemChannel) {
        return;
      }
      await systemChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`Thank You for Inviting Me to ${guild.name}`)
            .setDescription('Use `/` to see all my commands.')
            .setThumbnail(client.user?.avatarURL({ dynamic: true }) || ''),
        ],
      });
    } catch (err) {
      onError(err);
    }
  });
};

export default event;
