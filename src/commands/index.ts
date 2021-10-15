/* eslint-disable @typescript-eslint/no-var-requires */
import BotCommand from './bot-command';

const commands: BotCommand[] = [
  require('./misc/ping').default,
  require('./moderation/welcome').default,
  require('./moderation/leaving').default,
  require('./misc/translate').default,
  require('./misc/echo').default,
];

export default commands;
