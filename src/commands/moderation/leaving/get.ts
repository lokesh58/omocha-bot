import { MessageEmbed } from 'discord.js';
import { leavingModel } from '../../../models/leaving';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'get',
    description: 'Get the leaving message and leaving channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) {
      throw new Error('Guild ID is null!');
    }
    const leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      await interaction.followUp({
        content: 'Leaving Message is not set for the server!',
        ephemeral: true,
      });
      return;
    }
    await interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setTitle('Leaving Message Details')
          .addField('Message', leavingDetails.message)
          .addField('Channel', `<#${leavingDetails.channelId}>`),
      ],
      ephemeral: true,
    });
  },
} as BotSubCommand;
