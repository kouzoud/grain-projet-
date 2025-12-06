import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // États possibles : 'light' ou 'dark' uniquement
    const [theme, setTheme] = useState(() => {
        // Récupérer la préférence sauvegardée
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('solidarlink-theme');
            // Assurer que c'est soit 'light' soit 'dark'
            if (savedTheme === 'dark') return 'dark';
            return 'light'; // Par défaut: light
        }
        return 'light';
    });

    // Appliquer le thème au document
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Sauvegarder la préférence utilisateur
        localStorage.setItem('solidarlink-theme', theme);
    }, [theme]);

    const value = {
        theme,           // 'light' ou 'dark' uniquement
        effectiveTheme: theme,  // Identique au theme (pas de résolution système)
        setTheme,        // Fonction pour changer le thème
        isDark: theme === 'dark',
        toggleTheme: () => {
            // Alterne simplement entre light et dark
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
        }
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
