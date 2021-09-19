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
    const welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      await interaction.followUp({
        content: 'Welcome Message is not set for the server!',
        ephemeral: true,
      });
      return;
    }
    await welcomeDetails.delete();
    await interaction.followUp({
      content: 'Welcome Message deleted successfully.',
      ephemeral: true,
    });
  },
} as BotSubCommand;
