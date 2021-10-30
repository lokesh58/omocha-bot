import translate from '@iamtraction/google-translate';
import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../bot';
// eslint-disable-next-line @typescript-eslint/no-var-requires, prefer-destructuring
const languages: { [key: string]: string } = Object.entries(require('@iamtraction/google-translate').languages)
  .filter(([, v]) => typeof v === 'string')
  .reduce((a, [k, v]) => ({ ...a, [k]: v }), {});

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
      autocomplete: true,
    },
    {
      name: 'to',
      description: 'The language in which the text should be translated (Default: en).',
      type: 'STRING',
      required: false,
      autocomplete: true,
    },
  ],
  autocompleteHandler: async (interaction) => {
    const { options } = interaction;
    const value = options.getFocused();
    if (typeof value === 'string') {
      const getMatchScore = (k: string, v: string) => {
        if (k.startsWith(value) || v.startsWith(value)) {
          return 6;
        } else if (v.toLowerCase().startsWith(value)) {
          return 5;
        } else if (k.startsWith(value.toLowerCase()) || v.toLowerCase().startsWith(value.toLowerCase())) {
          return 4;
        } else if (k.includes(value) || v.includes(value)) {
          return 3;
        } else if (v.toLowerCase().includes(value)) {
          return 2;
        } else if (k.includes(value.toLowerCase()) || v.toLowerCase().includes(value.toLowerCase())) {
          return 1;
        }
        return 0;
      };
      const matchScores: {[key: string]: number} = Object.entries(languages).reduce((s, [k, v]) => ({ ...s, [k]: getMatchScore(k, v) }), {});
      const languageOptions = Object.keys(languages)
        .filter(k => matchScores[k] > 0)
        .sort((a, b) => matchScores[a] - matchScores[b])
        .slice(0, 25);
      await interaction.respond(languageOptions.map(k => ({ name: languages[k], value: k })));
    } else {
      await interaction.respond([]);
    }
  },
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
