import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '@/locales/ar/common.json';
import en from '@/locales/en/common.json';
import zh from '@/locales/zh/common.json';
import ru from '@/locales/ru/common.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', dir: 'rtl', flag: '🇪🇬' },
  { code: 'en', name: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'zh', name: '中文', dir: 'ltr', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', dir: 'ltr', flag: '🇷🇺' },
];

export function getLanguageDir(code) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  return lang ? lang.dir : 'ltr';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      zh: { translation: zh },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    supportedLngs: ['ar', 'en', 'zh', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'nafeiz_lang',
      caches: ['localStorage'],
    },
  });

export function applyDocumentLanguage(lang) {
  const dir = getLanguageDir(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

const initialLang = i18n.language || 'en';
applyDocumentLanguage(initialLang);

i18n.on('languageChanged', (lang) => {
  applyDocumentLanguage(lang);
});

export default i18n;
