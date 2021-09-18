import { MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'get',
    description: 'Get the welcome message and welcome channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    await interaction.deferReply();
    const { guildId } = interaction;
    if (!guildId) {
      throw new Error('Guild ID is null!');
    }
    const welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      await interaction.editReply({
        content: 'Welcome Message is not set for the server!',
      });
      return;
    }
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('Welcome Message Details')
          .addField('Message', welcomeDetails.message)
          .addField('Channel', `<#${welcomeDetails.channelId}>`),
      ],
    });
  },
} as BotSubCommand;
