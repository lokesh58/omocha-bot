import { MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import { guildOnlyError } from '../../../utils/constants';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'get',
    description: 'Get the welcome message and welcome channel for the server.',
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
    interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('Welcome Message Details')
          .addField('Message', welcomeDetails.message)
          .addField('Channel', `<#${welcomeDetails.channelId}>`),
      ],
    });
  },
} as BotSubCommand;
