import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ukTranslations from './locales/uk.json';
import enTranslations from './locales/en.json';
import itTranslations from './locales/it.json';
import deTranslations from './locales/de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uk: {
        translation: ukTranslations,
      },
      en: {
        translation: enTranslations,
      },
      it: {
        translation: itTranslations,
      },
      de: {
        translation: deTranslations,
      },
    },
    fallbackLng: 'uk',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 