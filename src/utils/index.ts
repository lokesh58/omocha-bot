import { Guild, MessageEmbed, MessageMentions, Role } from 'discord.js';

export const onError = (err: unknown): void => {
  let error: Error;
  if (err instanceof Error) {
    error = new Error(err.message);
    error.name = err.name;
  } else {
    error = new Error(`non Error type passed to onError\n${err}`);
    error.name = 'WARNING';
  }
  console.error(`${error.stack ?? error}`);
};

export const ensureArray = <T>(arg: T | T[]): T[] => Array.isArray(arg) ? arg : [arg];

export const getErrorEmbed = (msg: string): MessageEmbed => new MessageEmbed({ description: msg, color: 'RED' });

export const getSuccessEmbed = (msg: string): MessageEmbed => new MessageEmbed({ description: msg, color: 'GREEN' });

export const parseRoleMentions = async (roleString: string, guild: Guild): Promise<Role[]> => {
  const parsed = roleString.matchAll(MessageMentions.ROLES_PATTERN);
  const roleIds = Array.from(parsed).map(res => res[1]);
  const roles = await Promise.all(roleIds.map(async id => await guild.roles.fetch(id)));
  return roles.filter(r => r) as Role[];
};
