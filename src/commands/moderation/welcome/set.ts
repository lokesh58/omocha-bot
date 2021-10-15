import { MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the welcome message and/or welcome channel for the server.',
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
      await interaction.reply({
        content: 'Atleast one of `message` or `channel` is required!',
        ephemeral: true,
      });
      return;
    } else if (channel && channel.type !== 'GUILD_TEXT') {
      await interaction.reply({
        content: '`channel` must be a text channel!',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();
    let welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      if (!message || !channel) {
        await interaction.editReply({
          embeds: [
            new MessageEmbed()
              .setDescription('Both `message` and `channel` are required because welcome details are not set for this server!')
              .setColor('RED')
          ]
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
    await interaction.editReply({
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
