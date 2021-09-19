import { InteractionReplyOptions } from 'discord.js';

export const guildOnlyError: InteractionReplyOptions = {
  content: 'This command is only usable in a server!',
};

export const permissionError = (permissions: string[]): InteractionReplyOptions => ({
  content: `You need \`${permissions.join('`, `')}\` to use this command.`,
});
