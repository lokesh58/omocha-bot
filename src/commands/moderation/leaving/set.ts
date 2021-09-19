import { MessageEmbed } from 'discord.js';
import { leavingModel } from '../../../models/leaving';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the leaving message or leaving channel for the server.',
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'message',
        description: 'The leaving message for the server. Use `<@>` to mention the leaving member.',
        type: 'STRING',
        required: false,
      },
      {
        name: 'channel',
        description: 'The bot\'s leaving channel for the server.',
        type: 'CHANNEL',
        required: false,
      }
    ],
  },
  handler: async (interaction) => {
    const { guildId, options } = interaction;
    if (!guildId) {
      throw new Error('Guild ID is null!');
    }
    const message = options.getString('message');
    const channel = options.getChannel('channel');
    if (!message && !channel) {
      await interaction.followUp({
        content: 'Atleast one of `message` or `channel` is required!',
      });
      return;
    } else if (channel && channel.type !== 'GUILD_TEXT') {
      await interaction.followUp({
        content: '`channel` must be a text channel!',
      });
      return;
    }
    let leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      if (!message || !channel) {
        await interaction.followUp({
          content: 'Both `message` and `channel` are required because they are not set for this server!',
        });
        return;
      }
      leavingDetails = new leavingModel({
        _id: guildId,
        message,
        channelId: channel.id,
      });
      if (!leavingDetails) {
        throw new Error('Failed to create Leaving Message Details!');
      }
    } else {
      if (message) {
        leavingDetails.message = message;
      }
      if (channel) {
        leavingDetails.channelId = channel.id;
      }
    }
    leavingDetails = await leavingDetails.save();
    await interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setTitle('Leaving Message Details Set Successfully')
          .addField('Message', leavingDetails.message)
          .addField('Channel', `<#${leavingDetails.channelId}>`)
          .setColor('GREEN'),
      ],
    });
  },
} as BotSubCommand;
