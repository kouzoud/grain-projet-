import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('solidarlink-language', langCode);
    setIsOpen(false);
  };

  // Variante Dropdown Moderne
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-200 border border-gray-200 dark:border-slate-600"
          aria-label="Changer la langue"
          aria-expanded={isOpen}
        >
          <Globe className="w-4 h-4 text-gray-600 dark:text-slate-300" />
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-slate-300">
            {currentLanguage.code.toUpperCase()}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  {currentLanguage.code === 'ar' ? 'اختر اللغة' : 'Choisir la langue'}
                </p>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`
                      w-full px-3 py-2.5 flex items-center gap-3 rounded-lg
                      transition-all duration-200
                      ${i18n.language === lang.code 
                        ? 'bg-gradient-to-r from-cyan-50 to-violet-50 dark:from-cyan-900/30 dark:to-violet-900/30' 
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                      }
                    `}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1 text-left rtl:text-right">
                      <p className={`text-sm font-medium ${
                        i18n.language === lang.code 
                          ? 'text-cyan-600 dark:text-cyan-400' 
                          : 'text-gray-700 dark:text-slate-300'
                      }`}>
                        {lang.nativeName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-500">
                        {lang.name}
                      </p>
                    </div>
                    {i18n.language === lang.code && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Variante Toggle Simple (pour mobile ou navbar compacte)
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-xl p-1 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              px-3 py-1.5 rounded-lg flex items-center gap-2
              transition-all duration-200
              ${i18n.language === lang.code
                ? 'bg-white dark:bg-slate-600 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-slate-600'
              }
            `}
            aria-label={`Switch to ${lang.name}`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className={`text-sm font-medium ${
              i18n.language === lang.code 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-500 dark:text-slate-400'
            }`}>
              {lang.code.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Variante Icon seul (très compact)
  if (variant === 'icon') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          aria-label="Changer la langue"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3
                    transition-colors
                    ${i18n.language === lang.code 
                      ? 'bg-cyan-50 dark:bg-cyan-900/30' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-sm font-medium ${
                    i18n.language === lang.code 
                      ? 'text-cyan-600 dark:text-cyan-400' 
                      : 'text-gray-700 dark:text-slate-300'
                  }`}>
                    {lang.nativeName}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default LanguageSwitcher;
