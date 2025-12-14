import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#22D3EE',
        surface: '#0B1220',
      },
      boxShadow: {
        glass: '0 20px 45px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};

export default config;
