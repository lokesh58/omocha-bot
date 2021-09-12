import { welcomeModel } from '../../../models/welcome';
import { guildOnlyError } from '../../../utils/constants';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'delete',
    description: 'Delete the welcome message and welcome channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply(guildOnlyError);
      return;
    }
    await interaction.deferReply();
    const { guildId } = interaction;
    const welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      interaction.editReply({
        content: 'Welcome Message is not set for the server!',
      });
      return;
    }
    await welcomeDetails.delete();
    interaction.editReply({
      content: 'Welcome Message Details were deleted successfully.'
    });
  },
} as BotSubCommand;
