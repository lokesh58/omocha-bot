/* eslint-disable @typescript-eslint/no-var-requires */
import BotEvent from './bot-event';

const events: {[name: string]: BotEvent} = {
  ready: require('./ready').default,
  welcomeMessage: require('./welcome-message').default,
  leavingMessage: require('./leaving-message').default,
};

export default events;
