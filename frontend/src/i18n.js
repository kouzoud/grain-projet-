import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import translationFR from './locales/fr/translation.json';
import translationAR from './locales/ar/translation.json';

// Configuration des ressources de traduction
const resources = {
  fr: {
    translation: translationFR
  },
  ar: {
    translation: translationAR
  }
};

// Configuration du détecteur de langue
const detectionOptions = {
  order: ['localStorage', 'cookie', 'navigator'],
  lookupLocalStorage: 'solidarlink-language',
  lookupCookie: 'solidarlink-lang',
  cookieMinutes: 525600,
  caches: ['localStorage', 'cookie'],
};

// Initialisation d'i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar'],
    defaultNS: 'translation',
    detection: detectionOptions,
    interpolation: {
      escapeValue: false
    },
    debug: false,
    load: 'languageOnly',
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    }
  });

// Écouter les changements de langue pour gérer le RTL
i18n.on('languageChanged', (lng) => {
  const htmlElement = document.documentElement;
  
  if (lng === 'ar') {
    htmlElement.setAttribute('dir', 'rtl');
    htmlElement.setAttribute('lang', 'ar');
    document.body.classList.add('rtl');
  } else {
    htmlElement.setAttribute('dir', 'ltr');
    htmlElement.setAttribute('lang', lng);
    document.body.classList.remove('rtl');
  }
});

// Initialiser la direction au démarrage
const initDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.setAttribute('dir', initDir);
document.documentElement.setAttribute('lang', i18n.language || 'fr');
if (i18n.language === 'ar') {
  document.body.classList.add('rtl');
}

export default i18n;
