import { leavingModel } from '../../models/leaving';
import { onError } from '../../utils';
import BotEvent from '../bot-event';

const event: BotEvent = (client) => {
  client.on('guildMemberRemove', async (member) => {
    try {
      const { guild } = member;
      const leavingDetails = await leavingModel.findById(guild.id);
      if (!leavingDetails) {
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
        content: message.replace(/<@>/g, `<@${member.id}>`),
      });
    } catch (err) {
      onError(err);
    }
  });
};

export default event;
