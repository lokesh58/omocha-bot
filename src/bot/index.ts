import { ApplicationCommandOptionData, Client, ClientEvents, CommandInteraction, PermissionResolvable } from 'discord.js';

export type BotCommand = {
  name: string,
  description: string,
  options?: ApplicationCommandOptionData,
  userRequiredPermissions?: PermissionResolvable | PermissionResolvable[],
  botRequiredPermissions?: PermissionResolvable | PermissionResolvable[],
  guildOnly?: boolean,
  testOnly?: boolean,
  ownerOnly?: boolean,
  once?: (client: Client<true>) => Promise<void>,
  handler: (interaction: CommandInteraction) => Promise<void>,
};

export type BotEvent = keyof ClientEvents extends infer event ? event extends keyof ClientEvents ? {
  name: event,
  handler: (...args: ClientEvents[event]) => Promise<void>,
} : never : never;

const ensureArray = <T>(arg: T | T[]): T[] => Array.isArray(arg) ? arg : [arg];

type BotOptions = {
  client: Client<true>,
  commandsDir: string,
  eventsDir?: string,
  mongoDbURI?: string,
  testGuilds?: string | string[],
  botOwners?: string | string[],
};

export class Bot {
  readonly client: Client<true>;
  private commandsDir: string;
  private eventsDir?: string;
  private mongoDbURI?: string;
  private testGuilds: string[];
  private botOwners: string[];

  constructor(options: BotOptions) {
    const {
      client, commandsDir, eventsDir, mongoDbURI, testGuilds = [], botOwners = [],
    } = options;

    this.client = client;
    this.commandsDir = commandsDir;
    this.eventsDir = eventsDir;
    this.mongoDbURI = mongoDbURI;
    this.testGuilds = ensureArray(testGuilds);
    this.botOwners = ensureArray(botOwners);

    console.log(`${client.user.tag} is online and ready to go!`);
  }
}
