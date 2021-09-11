import { ApplicationCommandSubCommandData, Client, CommandInteraction } from 'discord.js';

interface BotSubCommand {
    data: ApplicationCommandSubCommandData,
    once?: (client: Client) => void,
    handler: (interaction: CommandInteraction) => void,
}

export default BotSubCommand;
