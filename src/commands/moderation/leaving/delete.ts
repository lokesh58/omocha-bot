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
    const leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      await interaction.followUp({
        content: 'Leaving Message is not set for the server!',
      });
      return;
    }
    await leavingDetails.delete();
    await interaction.followUp({
      content: 'Leaving Message deleted successfully.',
    });
  },
} as BotSubCommand;
