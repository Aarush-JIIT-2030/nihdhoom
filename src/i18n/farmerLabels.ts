export type FarmerLanguage = 'en' | 'hi';

export const farmerLanguageLabels: Record<FarmerLanguage, {
  home: string;
  fields: string;
  book: string;
  track: string;
  market: string;
  more: string;
  language: string;
}> = {
  en: {
    home: 'Home',
    fields: 'My Fields',
    book: 'Book Parali Pickup',
    track: 'Track My Machine',
    market: 'Parali Market',
    more: 'More',
    language: 'Language',
  },
  hi: {
    home: 'घर',
    fields: 'मेरे खेत',
    book: 'पराली उठवाएँ',
    track: 'मशीन ट्रैक करें',
    market: 'पराली बाज़ार',
    more: 'और विकल्प',
    language: 'भाषा',
  },
};
