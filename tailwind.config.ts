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
        wood: {
          950: '#19120d',
          900: '#2a1d13',
          800: '#3b2a1d',
          700: '#5a3f2b',
          600: '#745235'
        },
        sand: {
          50: '#fbf7f0',
          100: '#f3ead9',
          200: '#e8d4b0'
        },
        accent: {
          gold: '#c89a48'
        }
      },
      boxShadow: {
        panel: '0 24px 60px -28px rgba(14, 8, 4, 0.55)'
      },
      backgroundImage: {
        'wood-glow': 'radial-gradient(circle at 15% 0%, rgba(200, 154, 72, 0.26), transparent 55%), radial-gradient(circle at 85% 0%, rgba(114, 72, 40, 0.2), transparent 45%)'
      }
    }
  },
  plugins: []
};

export default config;
