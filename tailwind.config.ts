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
      },
    },
  },
};

export default config;
