import { MessageEmbed } from 'discord.js';

export const onError = (err: unknown): void => {
  let error: Error;
  if (err instanceof Error) {
    error = err;
  } else {
    error = new Error(`(WARNING: non Error type passed to onError)\n${err}`);
  }
  console.error(`${error.stack ?? error}`);
};

export const ensureArray = <T>(arg: T | T[]): T[] => Array.isArray(arg) ? arg : [arg];

export const getErrorEmbed = (msg: string): MessageEmbed => new MessageEmbed({ description: msg, color: 'RED' });
