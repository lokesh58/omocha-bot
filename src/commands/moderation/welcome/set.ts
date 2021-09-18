import { CollectorFilter, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from 'discord.js';
import { welcomeModel } from '../../../models/welcome';
import BotSubCommand from '../../bot-sub-command';

export default {
  data: {
    name: 'set',
    description: 'Set the welcome message or welcome channel for the server.',
    type: 'SUB_COMMAND',
    options: [
      {
        name: 'message',
        description: 'The welcome message for the server. Use `<@>` to mention the new member.',
        type: 'STRING',
        required: false,
      },
      {
        name: 'channel',
        description: 'The bot\'s welcome channel for the server.',
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
    let welcomeDetails = await welcomeModel.findById(guildId);
    if (!welcomeDetails) {
      if (!message || !channel) {
        await interaction.editReply({
          content: 'Both `message` and `channel` are required because they are not set for this server!',
        });
        return;
      }
      welcomeDetails = new welcomeModel({
        _id: guildId,
        message,
        channelId: channel.id,
      });
      if (!welcomeDetails) {
        throw new Error('Failed to create Welcome Message Details!');
      }
    } else {
      if (message) {
        welcomeDetails.message = message;
      }
      if (channel) {
        welcomeDetails.channelId = channel.id;
      }
    }
    const embed = new MessageEmbed()
      .setTitle('Welcome Message Details')
      .addField('Message', welcomeDetails.message)
      .addField('Channel', `<#${welcomeDetails.channelId}>`);
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
      await welcomeDetails.save();
      embed.setTitle('Welcome Message Details Saved Successfully');
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
