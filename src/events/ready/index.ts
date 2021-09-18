import { connectToDB, registerCommands } from '../../utils';
import BotEvent from '../bot-event';
import startCommandHandling from './command-handler';

const event: BotEvent = (client) => {
  client.once('ready', async () => {
    await connectToDB();
    await registerCommands(client);
    startCommandHandling(client);
    console.log(`${client.user?.username} is online and ready to go!`);
  });
};

export default event;
