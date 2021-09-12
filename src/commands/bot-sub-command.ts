import { ApplicationCommandSubCommandData } from 'discord.js';
import { CommandHandler, CommandSetupHandler } from './bot-command';

interface BotSubCommand {
    data: ApplicationCommandSubCommandData,
    once?: CommandSetupHandler,
    handler: CommandHandler,
}

export default BotSubCommand;
