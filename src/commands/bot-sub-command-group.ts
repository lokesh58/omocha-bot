import { ApplicationCommandSubGroupData, Client, CommandInteraction } from 'discord.js';

interface BotSubCommandGroup {
  data: ApplicationCommandSubGroupData,
  once?: (client?: Client) => void,
  handler: (interaction: CommandInteraction) => void,
}

export default BotSubCommandGroup;
