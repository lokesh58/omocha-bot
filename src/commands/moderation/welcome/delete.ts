import { MessageEmbed, MessageActionRow, MessageButton, CollectorFilter, MessageComponentInteraction } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'delete',
    description: 'Delete the welcome message and welcome channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    await interaction.deferReply();
    const { guildId, channel, user } = interaction;
    if (!guildId || !channel) {
      throw new Error('Guild ID or channel is null!');
    }
    const welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      await interaction.editReply({
        content: 'Welcome Message is not set for the server!',
      });
      return;
    }
    const embed = new MessageEmbed()
      .setTitle('Welcome Message Details')
      .addField('Message', welcomeDetails.message)
      .addField('Channel', `<#${welcomeDetails.channelId}>`);
    const getActionRow = (disabled=false) => 
      new MessageActionRow()
        .addComponents([
          new MessageButton()
            .setCustomId('delete')
            .setLabel('Delete')
            .setStyle('DANGER')
            .setDisabled(disabled),
          new MessageButton()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle('SECONDARY')
            .setDisabled(disabled),
        ]);
    const iMsg = await interaction.editReply({
      content: '**Following data will be deleted**',
      embeds: [embed],
      components: [getActionRow()],
    });
    const filter: CollectorFilter<MessageComponentInteraction[]> = msgInteraction => 
      msgInteraction.message.id === iMsg.id && msgInteraction.user.id === user.id;
    const msgInteraction = await channel.awaitMessageComponent({ filter, time: 20000/*ms*/ }).catch(/* Do Nothing, handled below */);
    if (!msgInteraction) {
      await interaction.editReply({
        content: '**This message expired**',
        embeds: [embed],
        components: [getActionRow(true)]
      });
      return;
    }
    switch (msgInteraction.customId) {
    case 'delete':
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await welcomeDetails.delete();
      embed.setTitle('');
      embed.setDescription('Welcome Message Details Deleted Successfully');
      embed.setColor('GREEN');
      embed.setFields([]);
      break;
    case 'cancel':
      embed.setDescription('Delete cancelled. Following data is retained');
      embed.setColor('RED');
      break;
    default:
      throw new Error('Invalid Interaction ID recieved!');
    }
    await msgInteraction.update({
      content: null,
      embeds: [embed],
      components: [],
    });
  },
} as BotSubCommand;
