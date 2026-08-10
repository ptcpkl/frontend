import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        accent: '#0284c7',
      },
    },
  },
  plugins: [],
};

export default config;