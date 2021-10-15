import { InteractionReplyOptions } from 'discord.js';

export const guildOnlyError: InteractionReplyOptions = {
  content: 'This command is only usable in a server!',
  ephemeral: true,
};

export const permissionError = (permissions: string[]): InteractionReplyOptions => ({
  content: `You need \`${permissions.join('`, `')}\` permissions to use this command.`,
  ephemeral: true,
});
