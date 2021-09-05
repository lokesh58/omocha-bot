import { ApplicationCommandData, Client, CommandInteraction } from 'discord.js';

interface CommandSetupHandler {
  (client?: Client): void,
}

export interface CommandHandler {
  (interaction: CommandInteraction): void,
}

interface BotCommand {
  readonly data: ApplicationCommandData,
  readonly once?: CommandSetupHandler,
  readonly handler: CommandHandler,
}

export default BotCommand;
