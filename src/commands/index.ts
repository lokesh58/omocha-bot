/* eslint-disable @typescript-eslint/no-var-requires */
import BotCommand from './bot-command';

const commands: BotCommand[] = [
  require('./misc/ping').default,
  require('./moderation/welcome-message').default,
];

export default commands;
