import { MessageEmbed, MessageActionRow, MessageButton, CollectorFilter, MessageComponentInteraction } from 'discord.js';
import { leavingModel } from '../../../models/leaving';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'delete',
    description: 'Delete the leaving message and leaving channel for the server.',
    type: 'SUB_COMMAND',
  },
  handler: async (interaction) => {
    await interaction.deferReply();
    const { guildId, channel, user } = interaction;
    if (!guildId || !channel) {
      throw new Error('Guild ID or channel is null!');
    }
    const leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      await interaction.editReply({
        content: 'Leaving Message is not set for the server!',
      });
      return;
    }
    const embed = new MessageEmbed()
      .setTitle('Leaving Message Details')
      .addField('Message', leavingDetails.message)
      .addField('Channel', `<#${leavingDetails.channelId}>`);
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
      await leavingDetails.delete();
      embed.setTitle('');
      embed.setDescription('Leaving Message Details Deleted Successfully');
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
