import { Client } from 'discord.js';
import { connect } from 'mongoose';
import commands from '../commands';
import events from '../events';

export const registerCommands = (client: Client): void => {
  const commandsData = commands.map(cmd => cmd.data);
  if (commandsData.length === 0) {
    console.log('No commands available!! Skipping command registration.');
  } else {
    console.log(`Registering the following command(s): ${commandsData.map(cmd => cmd.name).join(', ')}`);
    const testGuildId = process.env.TEST_GUILD_ID;
    if (testGuildId) {
      const testGuild = client.guilds.resolve(testGuildId);
      if (!testGuild) {
        throw new Error(`Failed to fetch test guild ${testGuildId}!`);
      }
      testGuild.commands.set(commandsData);
    } else {
      const app = client.application;
      if (!app) {
        throw new Error('Client does have any application associated with it!');
      }
      app.commands.set(commandsData);
    }
  }
};

export const startEvents = (client: Client): void => {
  Object.entries(events).forEach(([name, event]) => {
    console.log(`Starting event ${name}`);
    event(client);
  });
};

export const onError = (err: unknown): void => {
  let error: Error;
  if (err instanceof Error) {
    error = err;
  } else {
    error = new Error(`(WARNING: non Error type passed to onError)\n${err}`);
  }
  console.error(`${error.stack ?? error}`);
};

export const connectToDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('No MongoDB URI specified.');
    return;
  }
  await connect(uri);
  console.log('Connected to MongoDB!');
};
