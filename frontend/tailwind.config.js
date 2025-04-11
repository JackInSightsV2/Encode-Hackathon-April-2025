/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Solana color palette
        purple: {
          DEFAULT: '#9945FF',
          light: '#BF7FFF',
          dark: '#7A2BFF',
        },
        green: {
          DEFAULT: '#14F195',
          light: '#66F7C1',
          dark: '#0BC678',
        },
        blue: {
          DEFAULT: '#00C2FF',
          light: '#66DBFF',
          dark: '#00A3D3',
        },
        // Secondary colors
        teal: '#05D2DD',
        yellow: '#FFEC1F',
        orange: '#FF9C24',
        red: '#FF4557',
        // Neutrals
        black: '#000000',
        darkGray: '#141414',
        gray: '#2C2C2C',
        lightGray: '#858585',
        white: '#FFFFFF',
      },
      backgroundImage: {
        'gradient-purple-green': 'linear-gradient(45deg, #9945FF 0%, #14F195 100%)',
        'gradient-purple-blue': 'linear-gradient(45deg, #9945FF 0%, #00C2FF 100%)',
        'gradient-blue-green': 'linear-gradient(45deg, #00C2FF 0%, #14F195 100%)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'solana': '0 4px 14px 0 rgba(153, 69, 255, 0.2)',
      },
    },
  },
  plugins: [],
} 