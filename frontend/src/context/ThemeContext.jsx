import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // États possibles : 'light', 'dark', 'system'
    const [theme, setTheme] = useState(() => {
        // Récupérer la préférence sauvegardée
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('solidarlink-theme');
            return savedTheme || 'light'; // Par défaut: light
        }
        return 'light';
    });

    // Thème effectif (résolu si 'system')
    const [effectiveTheme, setEffectiveTheme] = useState('light');

    // Détecter la préférence système
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const updateEffectiveTheme = () => {
            if (theme === 'system') {
                const systemTheme = mediaQuery.matches ? 'dark' : 'light';
                setEffectiveTheme(systemTheme);
            } else {
                setEffectiveTheme(theme);
            }
        };

        // Initial update
        updateEffectiveTheme();

        // Écouter les changements de préférence système
        mediaQuery.addEventListener('change', updateEffectiveTheme);

        return () => {
            mediaQuery.removeEventListener('change', updateEffectiveTheme);
        };
    }, [theme]);

    // Appliquer le thème au document
    useEffect(() => {
        const root = document.documentElement;

        if (effectiveTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Sauvegarder la préférence utilisateur
        localStorage.setItem('solidarlink-theme', theme);
    }, [effectiveTheme, theme]);

    const value = {
        theme,           // 'light', 'dark', ou 'system'
        effectiveTheme,  // 'light' ou 'dark' (résolu)
        setTheme,        // Fonction pour changer le thème
        isDark: effectiveTheme === 'dark',
        toggleTheme: () => {
            // Cycle : light → dark → system → light
            setTheme(prev => {
                if (prev === 'light') return 'dark';
                if (prev === 'dark') return 'system';
                return 'light';
            });
        }
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
