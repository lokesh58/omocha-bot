import { BotEvent } from '../../bot';
import { leavingModel } from '../../models/leaving';
import { onError } from '../../utils';

export default {
  name: 'send-leaving-message',
  starter: (client) => {
    client.on('guildMemberRemove', async (member) => {
      try {
        const { guild } = member;
        const leavingDetails = await leavingModel.findById(guild.id);
        if (!leavingDetails) {
          console.log(`Leaving Details not found for guild <${guild.name}, ${guild.id}>`);
          return;
        }
        const { channelId, message } = leavingDetails;
        let channel = guild.channels.cache.get(channelId) ?? null;
        if (!channel) {
          channel = await guild.channels.fetch(channelId);
        }
        if (!channel) {
          throw new Error(`Unable to get the leaving message channel for guild with id ${guild.id}!`);
        }
        if (!channel.isText()) {
          throw new Error(`Leaving channel is not text channel for guild with id ${guild.id}!`);
        }
        await channel.send({
          content: message.replace(/<@>/g, `<@${member.id}> (${member.user?.tag || member.displayName})`),
        });
      } catch (err) {
        onError(err);
      }
    });
  },
} as BotEvent;
