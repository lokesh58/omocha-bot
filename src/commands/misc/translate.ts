import translate from '@iamtraction/google-translate';
import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../bot';
// eslint-disable-next-line @typescript-eslint/no-var-requires, prefer-destructuring
const languages: { [key: string]: string } = require('@iamtraction/google-translate').languages;

const getISOCode = (language: string | null) => {
  if (!language) {
    return null;
  }
  language = language.toLowerCase();
  if (language in languages) {
    return language;
  }
  const keys = Object.keys(languages).filter((key) => {
    if (typeof languages[key] !== 'string') {
      return null;
    }
    return languages[key].toLowerCase() === language;
  });
  return keys[0] || null;
};

export default {
  name: 'translate',
  description: 'Translate a given text using Google Translate.',
  options: [
    {
      name: 'text',
      description: 'The text to translate.',
      type: 'STRING',
      required: true,
    },
    {
      name: 'from',
      description: 'The text language (Default: auto).',
      type: 'STRING',
      required: false,
    },
    {
      name: 'to',
      description: 'The language in which the text should be translated (Default: en).',
      type: 'STRING',
      required: false,
    },
  ],
  handler: async (interaction) => {
    const { options } = interaction;
    const text = options.getString('text', true);
    const from = getISOCode(options.getString('from')) || 'auto';
    const to = getISOCode(options.getString('to')) || 'en';

    await interaction.deferReply();
    const result = await translate(text, {
      from,
      to,
    });
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setTitle('Translation Results')
          .addField(`Original Text - ${languages[result.from.language.iso]}`, result.from.text.value || text)
          .addField(`Translated Text - ${languages[to]}`, result.text),
      ],
    });
  },
} as BotCommand;