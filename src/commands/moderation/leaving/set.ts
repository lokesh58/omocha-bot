import { CollectorFilter, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { leavingModel } from '../../../models/leaving';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the leaving message or leaving channel for the server.',
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'message',
        description: 'The leaving message for the server. Use `<@>` to mention the leaving member.',
        type: 'STRING',
        required: false,
      },
      {
        name: 'channel',
        description: 'The bot\'s leaving channel for the server.',
        type: 'CHANNEL',
        required: false,
      }
    ],
  },
  handler: async (interaction) => {
    const { channel: iChannel, guildId, options, user: iUser } = interaction;
    if (!guildId || !iChannel) {
      throw new Error('Guild ID or channel is null!');
    }
    const message = options.getString('message');
    const channel = options.getChannel('channel');
    if (!message && !channel) {
      await interaction.reply({
        content: 'Atleast one of `message` or `channel` is required!',
        ephemeral: true,
      });
      return;
    } else if (channel && channel.type !== 'GUILD_TEXT') {
      await interaction.reply({
        content: '`channel` must be a text channel!',
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();
    let leavingDetails = await leavingModel.findById(guildId);
    if (!leavingDetails) {
      if (!message || !channel) {
        await interaction.editReply({
          content: 'Both `message` and `channel` are required because they are not set for this server!',
        });
        return;
      }
      leavingDetails = new leavingModel({
        _id: guildId,
        message,
        channelId: channel.id,
      });
      if (!leavingDetails) {
        throw new Error('Failed to create Leaving Message Details!');
      }
    } else {
      if (message) {
        leavingDetails.message = message;
      }
      if (channel) {
        leavingDetails.channelId = channel.id;
      }
    }
    const embed = new MessageEmbed()
      .setTitle('Leaving Message Details')
      .addField('Message', leavingDetails.message)
      .addField('Channel', `<#${leavingDetails.channelId}>`);
    const getActionRow = (disabled=false) => 
      new MessageActionRow()
        .addComponents([
          new MessageButton()
            .setCustomId('save')
            .setLabel('Save')
            .setStyle('SUCCESS')
            .setDisabled(disabled),
          new MessageButton()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle('SECONDARY')
            .setDisabled(disabled),
        ]);
    const iMsg = await interaction.editReply({
      content: '**Confirm the details to save**',
      embeds: [embed],
      components: [getActionRow()],
    });
    const filter: CollectorFilter<MessageComponentInteraction[]> = msgInteraction => 
      msgInteraction.message.id === iMsg.id && msgInteraction.user.id === iUser.id;
    const msgInteraction = await iChannel.awaitMessageComponent({ filter, time: 20000/*ms*/ }).catch(/* Do Nothing, handled below */);
    if (!msgInteraction) {
      await interaction.editReply({
        content: '**This message expired**',
        embeds: [embed],
        components: [getActionRow(true)]
      });
      return;
    }
    switch (msgInteraction.customId) {
    case 'save':
      await leavingDetails.save();
      embed.setTitle('Leaving Message Details Saved Successfully');
      embed.setColor('GREEN');
      break;
    case 'cancel':
      embed.setTitle('Save cancelled');
      embed.setColor('RED');
      embed.setFields([]);
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
