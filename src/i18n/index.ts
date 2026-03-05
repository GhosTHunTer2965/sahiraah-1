import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';

const resources = {
  english: { translation: en },
  hindi: { translation: hi },
  tamil: { translation: ta },
  telugu: { translation: te },
  kannada: { translation: kn },
  marathi: { translation: mr },
  bengali: { translation: bn },
  gujarati: { translation: gu },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'english',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Don't auto-detect; we set language from user preferences
      order: [],
    },
  });

export default i18n;
