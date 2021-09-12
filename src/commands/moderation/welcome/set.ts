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
      interaction.reply({
        content: 'Atleast one of `message` or `channel` is required!',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();
    let welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      if (!message || !channel) {
        interaction.editReply({
          content: 'Both `message` and `channel` are required because they are not set for this server!',
        });
        return;
      }
      welcomeDetails = await new welcomeModel({
        _id: guildId,
        message,
        channelId: channel.id,
      }).save();
    } else {
      if (message) {
        welcomeDetails.message = message;
      }
      if (channel) {
        welcomeDetails.channelId = channel.id;
      }
      welcomeDetails = await welcomeDetails.save();
    }
    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('Welcome Message updated successfully')
          .setColor('GREEN')
          .addField('Message', welcomeDetails.message)
          .addField('Channel', `<#${welcomeDetails.channelId}>`),
      ],
    });
  },
} as BotSubCommand;
