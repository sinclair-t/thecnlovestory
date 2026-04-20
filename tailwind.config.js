/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ec',
          100: '#f9efc9',
          200: '#f2db8e',
          300: '#e9c353',
          400: '#e0ab25',
          500: '#c9941a',
          600: '#a87213',
          700: '#865412',
          800: '#6e4115',
          900: '#5c3515',
        },
        forest: {
          50:  '#f2f7ee',
          100: '#e0ecd6',
          200: '#c2d9ae',
          300: '#9cbf7e',
          400: '#76a255',
          500: '#5a863c',
          600: '#456a2d',
          700: '#375527',
          800: '#2d4422',
          900: '#263a1d',
          950: '#111d0d',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#f8f4ec',
          200: '#f0e8d0',
          300: '#e4d5ae',
          400: '#d5bc86',
          500: '#c9a55e',
          600: '#b68b44',
          700: '#987238',
          800: '#7c5d32',
          900: '#664d2c',
        },
        dark: {
          50:  '#f6f2ee',
          100: '#e8dfd6',
          200: '#d4bfad',
          300: '#bb9980',
          400: '#a37658',
          500: '#8c5e3f',
          600: '#714a31',
          700: '#5a3b28',
          800: '#3c2518',
          900: '#2a180f',
          950: '#160c07',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.1' }],
        '8xl': ['6rem',   { lineHeight: '1.05' }],
        '9xl': ['8rem',   { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-up':    'fadeUp 0.7s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
};
