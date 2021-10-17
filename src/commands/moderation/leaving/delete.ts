import { MessageEmbed } from 'discord.js';
import { leavingModel } from '../../../models/leaving';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'delete',
    description: 'Delete the leaving message and leaving channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) {
      throw new Error('Guild ID is null!');
    }
    await interaction.deferReply();
    const leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription('Leaving Message is not set for the server!')
            .setColor('RED'),
        ],
      });
      return;
    }
    await leavingDetails.delete();
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription('Leaving Message deleted successfully.')
          .setColor('GREEN'),
      ],
    });
  },
} as BotSubCommand;
