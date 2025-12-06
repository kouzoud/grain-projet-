import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇲🇦',
    dir: 'rtl'
  }
];

const LanguageSwitcher = ({ variant = 'dropdown', className = '' }) => {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('solidarlink-language', langCode);
  };

  const toggleLanguage = () => {
    changeLanguage(i18n.language === 'fr' ? 'ar' : 'fr');
  };

  // Variante Dropdown transformée en toggle simple
  if (variant === 'dropdown') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 border border-gray-200 dark:border-slate-600 ${className}`}
        aria-label="Changer la langue"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
              {currentLanguage.code.toUpperCase()}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Variante Toggle Simple (pour mobile ou navbar compacte)
  if (variant === 'toggle') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLanguage}
        className={`px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 border border-gray-200 dark:border-slate-600 ${className}`}
        aria-label="Changer la langue"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {currentLanguage.code.toUpperCase()}
            </span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Variante Minimal (pour landing page - style glass avec meilleure visibilité en Light Mode)
  if (variant === 'minimal') {
    return (
      <motion.button
        onClick={toggleLanguage}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 text-gray-900 dark:text-white"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Changer la langue"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-bold">{currentLanguage.code.toUpperCase()}</span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  // Variante Icon seul (très compact)
  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleLanguage}
        className={`px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors ${className}`}
        aria-label="Changer la langue"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={i18n.language}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-bold text-gray-900 dark:text-white">{currentLanguage.code.toUpperCase()}</span>
          </motion.div>
        </AnimatePresence>
      </motion.button>
    );
  }

  return null;
};

export default LanguageSwitcher;
