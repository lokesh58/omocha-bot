import dotenv from 'dotenv';
dotenv.config();

import client from './client';
import { Bot } from './bot';

client.on('ready', () => {
  new Bot({
    client,
    commandsDir: './commands',
    eventsDir: './events',
    mongoDbURI: process.env.MONGODB_URI,
    testGuilds: process.env.TEST_GUILD_ID,
    botOwners: process.env.OWNER_ID,
  });
});

client.login(process.env.TOKEN);
