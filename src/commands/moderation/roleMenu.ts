import { GuildChannel, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { BotCommand } from '../../bot';
import { getErrorEmbed, parseRoleMentions } from '../../utils';

const handleCreate = async (interaction: CommandInteraction) => {
  const {
    options, channelId: iChannelId, client, guildId, 
  } = interaction;
  const roleString = options.getString('roles', true);
  const channelId = options.getChannel('channel')?.id || iChannelId;
  const message = options.getString('message') || 'Select roles below:';
  await interaction.deferReply();
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    throw new Error('Channel is null!');
  }
  if (!channel.isText()) {
    await interaction.editReply({
      embeds: [getErrorEmbed('`channel` must be a text channel')],
    });
    return;
  }
  const guild = await client.guilds.fetch(guildId);
  if (!guild.me?.permissionsIn(channel as GuildChannel).has('SEND_MESSAGES')) {
    await interaction.editReply({
      embeds: [getErrorEmbed('I don\'t have permission to send messages in the channel')],
    });
    return;
  }
  const roles = await parseRoleMentions(roleString, guild);
  const highestBotRole = guild.me.roles.highest;
  const successRoles = roles.filter(r => highestBotRole.comparePositionTo(r) > 0).sort((r1, r2) => r1.name < r2.name ? -1 : 1);
  if (!successRoles.length) {
    await interaction.editReply({
      embeds: [getErrorEmbed('All roles are above my position. I cannot add them to role select menu.')],
    });
    return;
  }
  await channel.send({
    content: message,
    components: [
      new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('role_select_menu')
            .setOptions(successRoles.map(r => ({ label: r.name, value: r.id, emoji: (r.icon || r.unicodeEmoji) ?? undefined })))
            .setMinValues(0)
            .setMaxValues(successRoles.length)
            .setPlaceholder('Select roles here...')
        ),
    ],
  });
  await interaction.editReply({
    embeds: [
      new MessageEmbed()
        .setTitle('Role Menu created successfully')
        .addField('Roles in Menu', successRoles.map(r => `<@&${r.id}>`).join(', '))
        .setColor('GREEN'),
    ],
  });
};

const handleEdit = async (interaction: CommandInteraction) => {
  const {
    options, channelId: iChannelId, client, guildId, 
  } = interaction;
  const channelId = options.getChannel('channel')?.id || iChannelId;
  const messageId = options.getString('message-id', true);
  const newMessage = options.getString('message');
  const addRoleString = options.getString('roles-to-add') || '';
  const removeRoleString = options.getString('roles-to-delete') || '';
  await interaction.deferReply();
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    throw new Error('Channel is null!');
  }
  if (!channel.isText()) {
    await interaction.editReply({
      embeds: [getErrorEmbed('`channel` must be a text channel')],
    });
    return;
  }
  const msg = await channel.messages.fetch(messageId);
  if (!msg || !(msg.author.id === client.user?.id) || !msg.components || !msg.components.length
    || !msg.components[0].components || !msg.components[0].components.length || !(msg.components[0].components[0].customId === 'role_select_menu')) {
    await interaction.editReply({
      embeds: [getErrorEmbed('Invalid `message-id`')],
    });
    return;
  }
  const guild = await client.guilds.fetch(guildId);
  const highestBotRole = guild.me?.roles.highest;
  if (!highestBotRole) {
    throw new Error('Bot doesn\'t have a highest role in the guild');
  }
  const addRoles = (await parseRoleMentions(addRoleString, guild)).filter(r => highestBotRole.comparePositionTo(r) > 0);
  const removeRoles = await parseRoleMentions(removeRoleString, guild);
  const { components: [actionRow] } = msg;
  const roleMenu = actionRow.components[0] as MessageSelectMenu;
  let menuOptions = roleMenu.options.map(o => ({ label: o.label, value: o.value, emoji: o.emoji ?? undefined } as MessageSelectOptionData));
  menuOptions.push(...addRoles.map(r => ({ label: r.name, value: r.id, emoji: (r.icon || r.unicodeEmoji) ?? undefined })));
  menuOptions = menuOptions.filter(o => removeRoles.every(r => r.id !== o.value)).sort((o1, o2) => o1.label < o2.label ? -1 : 1);
  if (!menuOptions.length) {
    await interaction.editReply({
      embeds: [getErrorEmbed('All roles will get removed after this, cannot proceed. Delete the message with role select menu directly if needed')],
    });
    return;
  }
  if (menuOptions.length > 25) {
    menuOptions = menuOptions.slice(0, 25);
  }
  roleMenu.setOptions(menuOptions);
  roleMenu.setMaxValues(menuOptions.length);
  await msg.edit({
    content: newMessage || msg.content,
    components: [actionRow],
  });
  const successEmbed = new MessageEmbed()
    .setTitle('Role Menu updated successfully')
    .setColor('GREEN');
  if (addRoles.length) {
    successEmbed.addField('Added Roles', addRoles.map(r => `<@&${r.id}>`).join(', '));
  }
  if (removeRoles.length) {
    successEmbed.addField('Removed Roles', removeRoles.map(r => `<@&${r.id}>`).join(', '));
  }
  successEmbed.addField('Current Roles in Menu', menuOptions.map(o => `<@&${o.value}>`).join(', '));
  await interaction.editReply({
    embeds: [successEmbed],
  });
};

export default {
  name: 'role-menu',
  description: 'Create a new or edit an existing role select menu.',
  options: [
    {
      name: 'create',
      description: 'Create a new role select menu.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'roles',
          description: 'The mentions of all roles to keep in the role select menu. (Max 25)',
          type: 'STRING',
          required: true,
        },
        {
          name: 'channel',
          description: 'The channel where to create the role select menu.',
          type: 'CHANNEL',
          channelTypes: ['GUILD_TEXT'],
          required: false,
        },
        {
          name: 'message',
          description: 'The message to display above the role select menu.',
          type: 'STRING',
          required: false,
        },
      ],
    },
    {
      name: 'edit',
      description: 'Edit an existing role select menu.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'channel',
          description: 'The channel where the role select menu is posted.',
          type: 'CHANNEL',
          channelTypes: ['GUILD_TEXT'],
          required: true,
        },
        {
          name: 'message-id',
          description: 'The message ID of the message containing role select menu.',
          type: 'STRING',
          required: true,
        },
        {
          name: 'message',
          description: 'The new message to display above the role select menu.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'roles-to-add',
          description: 'The mention of the new roles to add to the role select menu.',
          type: 'STRING',
          required: false,
        },
        {
          name: 'roles-to-delete',
          description: 'The mention of the roles to delete from the role select menu.',
          type: 'STRING',
          required: false,
        },
      ],
    },
  ],
  userRequiredPermissions: 'MANAGE_ROLES',
  botRequiredPermissions: 'MANAGE_ROLES',
  guildOnly: true,
  handler: async (interaction) => {
    const { options } = interaction;
    const subCmdName = options.getSubcommand(true);
    switch(subCmdName) {
    case 'create':
      return handleCreate(interaction);
    case 'edit':
      return handleEdit(interaction);
    default:
      throw new Error(`Invalid Sub Command ${subCmdName} recieved!`);
    }
  },
} as BotCommand;
