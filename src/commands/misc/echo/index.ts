import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../../bot';

export default {
  name: 'echo',
  description: 'Echoes the specified message.',
  options: [
    {
      name: 'message',
      description: 'The message to be echoed.',
      type: 'STRING',
      required: true,
    },
    {
      name: 'channel',
      description: 'The channel where message will be echoed.',
      type: 'CHANNEL',
      required: false,
    },
    {
      name: 'reply_to_message_id',
      description: 'ID of a message to make echoed message a reply to that message.',
      type: 'STRING',
      required: false,
    },
  ],
  handler: async (interaction) => {
    const { options, channelId: iChannelId, client } = interaction;
    const message = options.getString('message', true);
    const channelId = options.getChannel('channel')?.id || iChannelId;
    const replyMsgId = options.getString('reply_to_message_id') || '';
    await interaction.deferReply({ ephemeral: true });
    const channel = client.channels.cache.get(channelId) || await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error('No channel found in command `echo`');
    }
    if (!channel.isText()) {
      await interaction.reply({
        content: '`channel` must be a text channel',
        ephemeral: true,
      });
      return;
    }
    await channel.send({
      content: message,
      reply: { messageReference: replyMsgId, failIfNotExists: false },
    });
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('Message was sent successfully')
          .addField('Message', message)
          .addField('Channel', `<#${channel.id}>`)
          .setColor('GREEN'),
      ],
    });
  },
} as BotCommand;
