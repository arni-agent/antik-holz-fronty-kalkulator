import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'ah-dark': '#1e1712',
        'ah-wood': '#8a6243',
        'ah-wood-dark': '#745235',
        'ah-text-secondary': '#75695d',
        warmgray: '#ded6ca',
        cream: '#f5f0e8'
      },
      letterSpacing: {
        'wide-sm': '0.08em',
        'wide-md': '0.14em'
      }
    }
  },
  plugins: []
};

export default config;
