import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#18211f',
        paper: '#f5f7f2',
        moss: '#355c4b',
        mint: '#d6e9d5',
        coral: '#ef6f61',
        line: '#d9e0d8'
      },
      fontFamily: { sans: ['var(--font-geist)', 'sans-serif'], display: ['var(--font-space)', 'sans-serif'] },
      boxShadow: { soft: '0 18px 60px rgba(29, 58, 47, .10)' }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
export default config;
