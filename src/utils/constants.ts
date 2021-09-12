import { InteractionReplyOptions } from 'discord.js';

export const guildOnlyError: InteractionReplyOptions = {
  content: 'This command is only usable in a server!',
  ephemeral: true,
};
