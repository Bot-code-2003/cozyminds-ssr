/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'custom-md': '1065px',
      },
      colors: {
        'bg-navbar': 'var(--bg-navbar)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-journal-title': 'var(--text-journal-title)',
        'accent': 'var(--accent)',
        'highlight': 'var(--highlight)',
        'border': 'var(--border)',
        'card-bg': 'var(--card-bg)',
        'card-txt': 'var(--card-txt)',
      },
      backgroundColor: {
        'primary': 'var(--bg-primary)',
        'secondary': 'var(--bg-secondary)',
        'navbar': 'var(--bg-navbar)',
        'card': 'var(--card-bg)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'journal-title': 'var(--text-journal-title)',
        'card': 'var(--card-txt)',
      },
      borderColor: {
        'default': 'var(--border)',
      },
      boxShadow: {
        'default': '0 2px 4px var(--shadow)',
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'apple': '0.7rem',
        'apple-lg': '1.5rem',
      },
      animation: {
        'apple-fade': 'appleFade 0.5s ease-out',
        'apple-scale': 'appleScale 0.3s ease-out',
      },
      keyframes: {
        appleFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        appleScale: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
