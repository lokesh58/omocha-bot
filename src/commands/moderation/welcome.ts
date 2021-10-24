import { GuildCommandInteraction, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../bot';
import { welcomeModel } from '../../models/welcome';
import { getErrorEmbed, getSuccessEmbed } from '../../utils';

const handleGet = async (interaction: GuildCommandInteraction) => {
  const { guildId } = interaction;
  await interaction.deferReply();
  const welcomeDetails = await welcomeModel.findById(guildId);
  if (!welcomeDetails) {
    await interaction.editReply({
      embeds: [getErrorEmbed('Welcome Message is not set for the server!')],
    });
    return;
  }
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle('Welcome Message Details')
        .addField('Message', welcomeDetails.message)
        .addField('Channel', `<#${welcomeDetails.channelId}>`),
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
  let welcomeDetails = await welcomeModel.findById(guildId);
  if (!welcomeDetails) {
    if (!message || !channel) {
      await interaction.editReply({
        embeds: [getErrorEmbed('Both `message` and `channel` are required because welcome details are not set for this server!')],
      });
      return;
    }
    welcomeDetails = new welcomeModel({
      _id: guildId,
      message,
      channelId: channel.id,
    });
  } else {
    if (message) {
      welcomeDetails.message = message;
    }
    if (channel) {
      welcomeDetails.channelId = channel.id;
    }
  }
  welcomeDetails = await welcomeDetails.save();
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle('Welcome Message Details Set Successfully')
        .addField('Message', welcomeDetails.message)
        .addField('Channel', `<#${welcomeDetails.channelId}>`)
        .setColor('GREEN'),
    ],
  });
};

const handleDelete = async (interaction: GuildCommandInteraction) => {
  const { guildId } = interaction;
  await interaction.deferReply();
  const welcomeDetails = await welcomeModel.findById(guildId);
  if (!welcomeDetails) {
    await interaction.editReply({
      embeds: [getErrorEmbed('Welcome Message is not set for the server!')],
    });
    return;
  }
  await welcomeDetails.delete();
  await interaction.editReply({
    embeds: [getSuccessEmbed('Welcome Message deleted successfully.')],
  });
};

export default {
  name: 'welcome',
  description: 'Get or edit the welcome message or welcome channel for the server.',
  options: [
    {
      name: 'get',
      description: 'Get the welcome message and welcome channel for the server.',
      type: 'SUB_COMMAND',
    },
    {
      name: 'set',
      description: 'Set the welcome message and/or welcome channel for the server.',
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
          channelTypes: ['GUILD_TEXT'],
          required: false,
        },
      ],
    },
    {
      name: 'delete',
      description: 'Delete the welcome message and welcome channel for the server.',
      type: 'SUB_COMMAND',
    },
  ],
  userRequiredPermissions: 'MANAGE_GUILD',
  guildOnly: true,
  handler: async (interaction: GuildCommandInteraction) => {
    const { options } = interaction;
    const subCmdName = options.getSubcommand(true);
    switch(subCmdName) {
    case 'get':
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
