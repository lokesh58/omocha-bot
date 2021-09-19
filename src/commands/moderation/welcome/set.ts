import { MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the welcome message or welcome channel for the server.',
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'message',
        description: 'The welcome message for the server. Use `<@>` to mention the new member.',
        type: 'STRING',
        required: false,
      },
      {
        name: 'channel',
        description: 'The bot\'s welcome channel for the server.',
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
    let welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      if (!message || !channel) {
        await interaction.followUp({
          content: 'Both `message` and `channel` are required because they are not set for this server!',
        });
        return;
      }
      welcomeDetails = new welcomeModel({
        _id: guildId,
        message,
        channelId: channel.id,
      });
      if (!welcomeDetails) {
        throw new Error('Failed to create Welcome Message Details!');
      }
    } else {
      if (message) {
        welcomeDetails.message = message;
      }
      if (channel) {
        welcomeDetails.channelId = channel.id;
      }
    }
    welcomeDetails = await welcomeDetails.save();
    await interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setTitle('Welcome Message Details Set Successfully')
          .addField('Message', welcomeDetails.message)
          .addField('Channel', `<#${welcomeDetails.channelId}>`)
          .setColor('GREEN'),
      ],
    });
  },
} as BotSubCommand;
