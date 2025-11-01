import type { Config } from 'tailwindcss';

type ExtendedConfig = Config & {
  safelist?: string[];
};

const config: ExtendedConfig = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './templates/**/*.{ts,tsx}',
  ],
  safelist: [
    'bg-primary',
    'text-primary',
    'bg-secondary',
    'text-secondary',
    'bg-accent1',
    'bg-accent2',
    'bg-accent3',
    'text-accent1',
    'text-accent2',
    'text-accent3',
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
        'accent-1': 'var(--color-accent-1)',
        'accent-2': 'var(--color-accent-2)',
        'accent-3': 'var(--color-accent-3)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
    },
  },
};

export default config;
