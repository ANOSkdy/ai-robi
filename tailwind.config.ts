import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './templates/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green1: '#1B512D',
          green2: '#7FB069',
          earth1: '#E6AA68',
          earth2: '#A67458',
          light: '#F3F9E3',
        },
        base: 'var(--color-base)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent1: 'var(--color-accent-1)',
        accent2: 'var(--color-accent-2)',
        accent3: 'var(--color-accent-3)',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
      },
    },
  },
};

export default config;
