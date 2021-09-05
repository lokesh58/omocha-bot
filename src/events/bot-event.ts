import { Client } from 'discord.js';

interface BotEvent {
  (client: Client): void,
}

export default BotEvent;
