/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fond global (Deep Space Blue)
        background: '#0b1120',
        // Fond des cartes (Légèrement plus clair)
        surface: '#1e293b',
        // Bordures (Cyan électrique mais subtil)
        border: '#334155',
        // Accents pour les graphiques
        primary: {
          DEFAULT: '#06b6d4',   // Cyan
          dark: '#0891b2',
          light: '#67e8f9',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // Violet
          light: '#a78bfa',
        },
        accent: '#f59e0b',    // Or/Ambre
        success: '#10b981',   // Vert Néon
        danger: '#ef4444',    // Rouge
        warning: '#f59e0b',   // Jaune

        // Keeping legacy names mapped to new theme or safe fallbacks to avoid breaking other pages too much
        page: {
          DEFAULT: '#0b1120',
          card: '#1e293b',
        },
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.primary.DEFAULT"), 0 0 20px theme("colors.primary.DEFAULT")',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
