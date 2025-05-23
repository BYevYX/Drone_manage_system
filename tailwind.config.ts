import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        nekstblack: ['Nekst-Black', 'sans-serif'],
        nekstthin: ['Nekst-Thin', 'sans-serif'],
        nekstregular: ['Nekst-Regular', 'sans-serif'],
        nekstmedium: ['Nekst-Medium', 'sans-serif'],
        nekstlight: ['Nekst-Light', 'sans-serif'],
        nekstsemibold: ['Nekst-Semibold', 'sans-serif'],
        poppinsmedium: ['Roboto', 'sans-serif'],
      },
      devIndicators: {
        autoPrerender: false, // Отключает индикатор
      },
    },
  },
  plugins: [],
} satisfies Config;
