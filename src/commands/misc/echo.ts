import { GuildChannel, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../bot';
import { getErrorEmbed } from '../../utils';

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
      channelTypes: ['GUILD_PRIVATE_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_TEXT'],
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
    const {
      options, channelId: iChannelId, client, guildId, 
    } = interaction;
    const message = options.getString('message', true);
    const channelId = options.getChannel('channel')?.id || iChannelId;
    const replyMsgId = options.getString('reply_to_message_id') || '';
    await interaction.deferReply({ ephemeral: true });
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      throw new Error('Channel is null!');
    }
    if (guildId) {
      const guild = await client.guilds.fetch(guildId);
      const reqPerm = channel.isThread() ? 'SEND_MESSAGES_IN_THREADS' : 'SEND_MESSAGES';
      if (!guild.me?.permissionsIn(channel as GuildChannel).has(reqPerm)) {
        await interaction.editReply({
          embeds: [getErrorEmbed('I don\'t have permission to send messages in the channel')],
        });
        return;
      }
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
