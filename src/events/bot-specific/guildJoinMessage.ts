import { MessageEmbed } from 'discord.js';
import { BotEvent } from '../../bot';
import { onError } from '../../utils';

export default {
  name: 'send-guild-join-message',
  starter: (client) => {
    client.on('guildCreate', async (guild) => {
      console.log(`Added to guild <${guild.name}, ${guild.id}>`);
      try{
        const { systemChannel } = guild;
        if (!systemChannel) {
          console.log(`System Channel not found in guild <${guild.name}, ${guild.id}>`);
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
  },
} as BotEvent;
