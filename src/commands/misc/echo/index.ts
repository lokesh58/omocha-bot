import { GuildMember, MessageEmbed, TextBasedChannels } from 'discord.js';
import BotCommand from '../../bot-command';

export default {
  data: {
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
        description: 'ID of a message to make sent message a reply to that message.',
        type: 'STRING',
        required: false,
      }
    ],
  },
  handler: async (interaction) => {
    const { options, channel: iChannel, member } = interaction;
    const message = options.getString('message', true);
    const channel = options.getChannel('channel') || iChannel as TextBasedChannels;
    const replyMsgId = options.getString('reply_to_message_id') || '';
    if (channel.type !== 'GUILD_TEXT' && channel.type !== 'DM') {
      await interaction.reply({
        content: '`channel` must be a text channel',
        ephemeral: true,
      });
      return;
    }
    if (channel.type === 'GUILD_TEXT' && !(member as GuildMember).permissionsIn(channel).has('SEND_MESSAGES')) {
      await interaction.reply({
        content: 'You do not have permissions to send messages in the channel',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    await (channel as TextBasedChannels).send({
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
  }
} as BotCommand;
