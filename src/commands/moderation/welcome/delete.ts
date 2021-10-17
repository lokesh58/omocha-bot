import { MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'delete',
    description: 'Delete the welcome message and welcome channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    const { guildId } = interaction;
    if (!guildId) {
      throw new Error('Guild ID is null!');
    }
    await interaction.deferReply();
    const welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      await interaction.editReply({
        embeds: [
          new MessageEmbed()
            .setDescription('Welcome Message is not set for the server!')
            .setColor('RED'),
        ],
      });
      return;
    }
    await welcomeDetails.delete();
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription('Welcome Message deleted successfully.')
          .setColor('GREEN'),
      ],
    });
  },
} as BotSubCommand;
