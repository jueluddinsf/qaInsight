import type { Config } from 'tailwindcss';

import { heroui } from '@heroui/theme';

const config = {
  content: ['./app/**/*.{js,ts,tsx,mdx}', './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      layout: {
        borderWidth: {
          small: '1px',
          medium: '1px',
          large: '2px',
        },
        radius: {
          small: '8px',
          medium: '12px',
          large: '16px',
        },
      },
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: '#F36621',
              50: '#fef5f0',
              100: '#fde8df',
              200: '#fbcebe',
              300: '#f8a98f',
              400: '#f67e56',
              500: '#f36621',
              600: '#e14a11',
              700: '#ba3710',
              800: '#942e13',
              900: '#782813',
            },
            background: '#fafafa',
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: '#F36621',
              50: '#fef5f0',
              100: '#fde8df',
              200: '#fbcebe',
              300: '#f8a98f',
              400: '#f67e56',
              500: '#f36621',
              600: '#e14a11',
              700: '#ba3710',
              800: '#942e13',
              900: '#782813',
            },
            background: '#0a0a0a',
          },
        },
      },
    }),
  ],
} satisfies Config;

export default config;
