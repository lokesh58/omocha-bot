import { ApplicationCommandData, Client, CommandInteraction } from 'discord.js';

export interface CommandSetupHandler {
  (client?: Client): Promise<void>,
}

export interface CommandHandler {
  (interaction: CommandInteraction): Promise<void>,
}

interface BotCommand {
  readonly data: ApplicationCommandData,
  readonly once?: CommandSetupHandler,
  readonly handler: CommandHandler,
}

export default BotCommand;
