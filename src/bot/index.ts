import { ApplicationCommandOptionData, ChatInputApplicationCommandData, Client, Collection,
  CommandInteraction, GuildMember, InteractionReplyOptions, Permissions, PermissionString } from 'discord.js';
import glob from 'glob';
import { connect } from 'mongoose';
import { resolve as resolvePath } from 'path';
import { ensureArray, getErrorEmbed, onError } from '../utils';

export type BotCommand = {
  name: string,
  description: string,
  options?: ApplicationCommandOptionData[],
  userRequiredPermissions?: PermissionString | PermissionString[],
  botRequiredPermissions?: PermissionString | PermissionString[],
  guildOnly?: boolean,
  ownerOnly?: boolean,
  once?: (client: Client<true>) => Promise<void>,
  handler: (interaction: CommandInteraction) => Promise<void>,
};

export type BotEvent = {
  name: string,
  starter: (client: Client<true>) => void,
};

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
  private commands: BotCommand[] = [];
  private events: BotEvent[] = [];

  constructor(options: BotOptions) {
    const {
      client, commandsDir, eventsDir, mongoDbURI, testGuilds = [], botOwners = [],
    } = options;

    // Initialize class variables
    this.client = client;
    this.commandsDir = commandsDir;
    this.eventsDir = eventsDir;
    this.mongoDbURI = mongoDbURI;
    this.testGuilds = ensureArray(testGuilds);
    this.botOwners = ensureArray(botOwners);

    // Setup and start the bot
    this.init();
  }

  private init = async () => {
    // Connect to MongoDB
    await this.connectToMongoDB();

    // Load and register all commands
    this.commands = await this.loadFiles(this.commandsDir);
    await this.registerCommands();

    // Load and start the events
    this.events = this.eventsDir ? await this.loadFiles(this.eventsDir) : [];
    this.startEvents();

    // Start handling commands
    await this.startCommandHandling();

    console.log(`${this.client.user.tag} is online and ready to go!`);
  }

  private connectToMongoDB = async () => {
    const { mongoDbURI: uri } = this;
    if (!uri) {
      console.warn('No MongoDB URI specified.'); 
      return;
    }
    await connect(uri);
    console.log('Connected to MongoDB!');
  }

  private loadFiles = async (dir: string) => {
    const fileNames = glob.sync(`${resolvePath(dir)}/**/*.{ts,js}`);
    const allFiles = await Promise.all(fileNames.map(async fileName => (await import(fileName)).default ));
    return allFiles.filter(f => f && f.name);
  }

  private registerCommands = async () => {
    const { client, commands, testGuilds } = this;
    const commandsData = commands.map((cmd) => {
      const { name, description, options } = cmd;
      return {
        name,
        description,
        options,
      } as ChatInputApplicationCommandData;
    });
    const { application: app } = client;
    if (testGuilds.length) {
      await Promise.all(testGuilds.map(async (guildId) => {
        console.log(`Registering following command(s) to test guild with id ${guildId}:\n${commandsData.map(c => c.name).join(', ') || '<No commands>'}`);
        await app.commands.set(commandsData, guildId); 
      }));
    }
    console.log(`Registering following global command(s):\n${commandsData.map(c => c.name).join(', ') || '<No commands>'}`);
    await app.commands.set(commandsData);
    // TODO: Use this code when method to update existing commands is made
    // const currentCommands = await app.commands.fetch();
    // await Promise.all([
    //   ...currentCommands.filter(c => commandsData.every(cd => cd.name !== c.name)).map(async (cmd) => {
    //     console.log(`Deleting global command ${cmd.name}`);
    //     await cmd.delete();
    //   }),
    //   ...commandsData.filter(cd => currentCommands.every(c => c.name !== cd.name)).map(async (cmdData) => {
    //     console.log(`Creating global command ${cmdData.name}`);
    //     await app.commands.create(cmdData);
    //   }),
    // ]);
    // const unchangedCommandsData = commandsData.filter(cd => currentCommands.some(c => c.name === cd.name));
    // console.log(`No changes made to command(s):\n${unchangedCommandsData.map(c => c.name).join(', ') || '<No commands>'}`);
  }

  private startEvents = () => {
    this.events.forEach((event) => {
      console.log(`Starting event ${event.name}`);
      event.starter(this.client);
    });
  }

  private startCommandHandling = async () => {
    const { botOwners, client, commands } = this;
    const cmdCollection = new Collection<string, BotCommand>();
    await Promise.all(commands.map(async (cmd) => {
      cmdCollection.set(cmd.name, cmd);
      if (cmd.once) {
        await cmd.once(client);
      }
    }));
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) {
        return;
      }
      try {
        const {
          commandId, commandName, user, member, guild,
        } = interaction;
        const cmd = cmdCollection.get(commandName);
        if (!cmd) {
          throw new Error(`Unknown command <${commandName}, ${commandId}> recieved!`);
        }
        if (cmd.guildOnly && !interaction.inGuild()) {
          console.log(`<${user.tag}, ${user.id}> tried using guild only command ${commandName} outside guild`);
          await interaction.reply({
            embeds: [getErrorEmbed('This command is only usable in a server!')],
            ephemeral: true,
          });
          return;
        }
        if (cmd.ownerOnly && !botOwners.includes(user.id)) {
          console.log(`<${user.tag}, ${user.id}> tried using owner only command ${commandName} when they are not a bot owner`);
          await interaction.reply({
            embeds: [getErrorEmbed('This command is only usable by a bot owner!')],
            ephemeral: true,
          });
          return;
        }
        if (cmd.userRequiredPermissions) {
          const reqdPerms = ensureArray(cmd.userRequiredPermissions);
          let missingPerms = reqdPerms;
          if (member) {
            const userPerms = member instanceof GuildMember ? member.permissions : new Permissions(BigInt(member.permissions));
            missingPerms = reqdPerms.filter(p => !userPerms.has(p));
          }
          if (missingPerms.length) {
            console.log(`<${user.tag}, ${user.id}> tried using command ${commandName} but failed due to user missing permissions: ${missingPerms.join(', ')}`);
            await interaction.reply({
              embeds: [getErrorEmbed(`You are missing the following permissions required to run this command:\n\`${missingPerms.join('`, `')}\`}`)],
              ephemeral: true,
            });
            return;
          }
        }
        if (cmd.botRequiredPermissions) {
          const reqdPerms = ensureArray(cmd.botRequiredPermissions);
          let missingPerms = reqdPerms;
          if (guild?.me) {
            const { me } = guild;
            missingPerms = reqdPerms.filter(p => !me.permissions.has(p));
          }
          if (missingPerms.length) {
            console.log(`<${user.tag}, ${user.id}> tried usingcommand ${commandName} but failed due to bot missing permissions: ${missingPerms.join(', ')}`);
            await interaction.reply({
              embeds: [getErrorEmbed(`I'm missing the following permissions required to run this command:\n\`${missingPerms.join('`, `')}\`}`)],
              ephemeral: true,
            });
            return;
          }
        }
        console.log(`<${user.tag}, ${user.id}> used command ${commandName}`);
        await cmd.handler(interaction);
      } catch (err) {
        onError(err);
        const errorResponse: InteractionReplyOptions = {
          embeds: [getErrorEmbed('An error occurred! Please try again.')],
          ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorResponse).catch(console.error);
        } else {
          await interaction.reply(errorResponse).catch(console.error);
        }
      }
    });
  }
}
