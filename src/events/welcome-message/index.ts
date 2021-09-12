import { welcomeModel } from '../../models/welcome';
import { onError } from '../../utils';
import BotEvent from '../bot-event';

const event: BotEvent = (client) => {
  client.on('guildMemberAdd', async (member) => {
    try {
      const { guild } = member;
      const welcomeDetails = await welcomeModel.findById(guild.id);
      if (!welcomeDetails) {
        return;
      }
      const { channelId, message } = welcomeDetails;
      let channel = guild.channels.cache.get(channelId) ?? null;
      if (!channel) {
        channel = await guild.channels.fetch(channelId);
      }
      if (!channel) {
        throw new Error(`Unable to get the welcome message channel for guild with id ${guild.id}!`);
      }
      if (!channel.isText()) {
        throw new Error(`Welcome channel is not text channel for guild with id ${guild.id}!`);
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
