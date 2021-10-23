import { GuildCommandInteraction, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../bot';
import { leavingModel } from '../../models/leaving';
import { getErrorEmbed, getSuccessEmbed } from '../../utils';

const handleGet = async (interaction: GuildCommandInteraction) => {
  const { guildId } = interaction;
  await interaction.deferReply();
  const leavingDetails = await leavingModel.findById(guildId);
  if (!leavingDetails) {
    await interaction.editReply({
      embeds: [getErrorEmbed('Leaving Message is not set for the server!')],
    });
    return;
  }
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle('Leaving Message Details')
        .addField('Message', leavingDetails.message)
        .addField('Channel', `<#${leavingDetails.channelId}>`),
    ],
  });
};

const handleSet = async (interaction: GuildCommandInteraction) => {
  const { guildId, options, client } = interaction;
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
  const guild = await client.guilds.fetch(guildId);
  if (channel && !guild.me?.permissionsIn(channel).has('SEND_MESSAGES')) {
    await interaction.editReply({
      embeds: [getErrorEmbed('I don\'t have permission to send messages in that channel')],
    });
    return;
  }
  let leavingDetails = await leavingModel.findById(guildId);
  if (!leavingDetails) {
    if (!(message && channel)) {
      await interaction.editReply({
        embeds: [getErrorEmbed('Both `message` and `channel` are required because leaving details are not set for this server!')],
      });
      return;
    }
    leavingDetails = new leavingModel({
      _id: guildId,
      message,
      channelId: channel.id,
    });
  } else {
    if (message) {
      leavingDetails.message = message;
    }
    if (channel) {
      leavingDetails.channelId = channel.id;
    }
  }
  leavingDetails = await leavingDetails.save();
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle('Leaving Message Details Set Successfully')
        .addField('Message', leavingDetails.message)
        .addField('Channel', `<#${leavingDetails.channelId}>`)
        .setColor('GREEN'),
    ],
  });
};

const handleDelete = async (interaction: GuildCommandInteraction) => {
  const { guildId } = interaction;
  await interaction.deferReply();
  const leavingDetails = await leavingModel.findById(guildId);
  if (!leavingDetails) {
    await interaction.editReply({
      embeds: [getErrorEmbed('Leaving Message is not set for the server!')],
    });
    return;
  }
  await leavingDetails.delete();
  await interaction.editReply({
    embeds: [getSuccessEmbed('Leaving Message deleted successfully.')],
  });
};

export default {
  name: 'leaving',
  description: 'Get or edit the leaving message or leaving channel for the server.',
  options: [
    {
      name: 'get',
      description: 'Get the leaving message and leaving channel for the server.',
      type: 'SUB_COMMAND',
    },
    {
      name: 'set',
      description: 'Set the leaving message and/or leaving channel for the server.',
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
          channelTypes: ['GUILD_TEXT'],
          required: false,
        },
      ],
    },
    {
      name: 'delete',
      description: 'Delete the leaving message and leaving channel for the server.',
      type: 'SUB_COMMAND',
    },
  ],
  userRequiredPermissions: 'MANAGE_GUILD',
  handler: async (interaction: GuildCommandInteraction) => {
    const { options } = interaction;
    const subCmdName = options.getSubcommand(true);
    switch(subCmdName) {
    case'get':
      return handleGet(interaction);
    case 'set':
      return handleSet(interaction);
    case 'delete':
      return handleDelete(interaction);
    default:
      throw new Error(`Invalid Sub Command ${subCmdName} recieved!`);
    }
  },
} as BotCommand;
