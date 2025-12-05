import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ variant = 'icon', showLabel = false }) => {
    const { theme, setTheme, effectiveTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const themes = [
        { value: 'light', label: 'Clair', icon: Sun, color: 'text-amber-500' },
        { value: 'dark', label: 'Sombre', icon: Moon, color: 'text-indigo-400' },
        { value: 'system', label: 'Auto', icon: Monitor, color: 'text-cyan-500' },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[2];

    // Fermer le dropdown si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Variante Dropdown
    if (variant === 'dropdown') {
        return (
            <div className="relative" ref={dropdownRef}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 transition-all duration-200"
                    aria-label="Changer le thème"
                >
                    <motion.div
                        key={effectiveTheme}
                        initial={{ rotate: -30, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        {effectiveTheme === 'dark' ? (
                            <Moon className="w-5 h-5 text-indigo-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-500" />
                        )}
                    </motion.div>
                    {showLabel && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                            {currentTheme.label}
                        </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-slate-900/50 border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
                        >
                            <div className="p-1">
                                {themes.map(({ value, label, icon: Icon, color }) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            setTheme(value);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-left
                                            transition-all duration-150
                                            ${theme === value 
                                                ? 'bg-cyan-50 dark:bg-cyan-500/10' 
                                                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <div className={`p-1.5 rounded-lg ${theme === value ? 'bg-cyan-100 dark:bg-cyan-500/20' : 'bg-gray-100 dark:bg-slate-700'}`}>
                                            <Icon className={`w-4 h-4 ${theme === value ? color : 'text-gray-500 dark:text-gray-400'}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${theme === value ? 'text-cyan-700 dark:text-cyan-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {label}
                                        </span>
                                        {theme === value && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="ml-auto"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
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

    // Variante Icon (toggle simple avec cycle)
    if (variant === 'icon') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (theme === 'light') setTheme('dark');
                    else if (theme === 'dark') setTheme('system');
                    else setTheme('light');
                }}
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
                        {theme === 'system' ? (
                            <Monitor className="w-5 h-5 text-cyan-500" />
                        ) : theme === 'dark' ? (
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
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
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

    // Variante Pill (boutons radio visuels)
    if (variant === 'pill') {
        return (
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                {themes.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                            ${theme === value
                                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }
                        `}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>
        );
    }

    // Variante Minimal (pour landing page - fond transparent)
    if (variant === 'minimal') {
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                    if (theme === 'light') setTheme('dark');
                    else if (theme === 'dark') setTheme('system');
                    else setTheme('light');
                }}
                className="relative p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all duration-200 group"
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
                        {theme === 'system' ? (
                            <Monitor className="w-5 h-5 text-cyan-400" />
                        ) : theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-indigo-300" />
                        ) : (
                            <Sun className="w-5 h-5 text-amber-400" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {currentTheme.label}
                </div>
            </motion.button>
        );
    }

    return null;
};

export default ThemeToggle;
