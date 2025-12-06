import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ variant = 'icon', showLabel = false }) => {
    const { theme, setTheme, effectiveTheme } = useTheme();

    const themes = [
        { value: 'light', label: 'Clair', icon: Sun, color: 'text-amber-500' },
        { value: 'dark', label: 'Sombre', icon: Moon, color: 'text-indigo-400' }
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[0];

    // Fonction pour changer le thème (toggle entre light et dark)
    const handleToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    // Variante Dropdown transformée en simple bouton toggle
    if (variant === 'dropdown') {
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-all duration-200"
                aria-label="Changer le thème"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={effectiveTheme}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        {effectiveTheme === 'dark' ? (
                            <Moon className="w-5 h-5 text-indigo-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                        )}
                    </motion.div>
                </AnimatePresence>
                {showLabel && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                        {currentTheme.label}
                    </span>
                )}
            </motion.button>
        );
    }

    // Variante Icon (toggle simple entre light et dark)
    if (variant === 'icon') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-all duration-200 group"
                aria-label="Changer le thème"
                title={`Mode actuel : ${currentTheme.label}`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-indigo-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {currentTheme.label}
                </div>
            </motion.button>
        );
    }

    // Variante Switch
    if (variant === 'switch') {
        const isDark = effectiveTheme === 'dark';

        return (
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <Sun className={`w-4 h-4 transition-colors ${!isDark ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`} />

                <button
                    onClick={handleToggle}
                    className={`
                        relative w-14 h-7 rounded-full transition-colors duration-300
                        ${isDark ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-slate-600'}
                    `}
                    aria-label="Toggle theme"
                >
                    <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                        style={{ left: isDark ? '2rem' : '0.25rem' }}
                    >
                        {isDark ? (
                            <Moon className="w-3 h-3 text-indigo-500" />
                        ) : (
                            <Sun className="w-3 h-3 text-amber-500" />
                        )}
                    </motion.div>
                </button>

                <Moon className={`w-4 h-4 transition-colors ${isDark ? 'text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
        );
    }

    // Variante Pill (boutons toggle visuels)
    if (variant === 'pill') {
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-all duration-200"
                aria-label="Changer le thème"
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                    >
                        {theme === 'dark' ? (
                            <>
                                <Moon className="w-4 h-4 text-indigo-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Sombre</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Clair</span>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.button>
        );
    }

    // Variante Minimal (pour landing page - fond transparent avec meilleure visibilité en Light Mode)
    if (variant === 'minimal') {
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggle}
                className="relative p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 border border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all duration-200 group"
                aria-label="Changer le thème"
                title={`Mode actuel : ${currentTheme.label}`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                    {currentTheme.label}
                </div>
            </motion.button>
        );
    }

    return null;
};

export default ThemeToggle;
