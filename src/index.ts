import dotenv from 'dotenv';
dotenv.config();

import client from './client';
import { startEvents } from './utils';

startEvents(client);
client.login(process.env.TOKEN);
