/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7f2',
          100: '#e8ede4',
          200: '#d1dac9',
          300: '#a8c284',
          400: '#7eb54d',
          500: '#6fa63a',
          600: '#558a2b',
          700: '#426b22',
          800: '#34531a',
          900: '#2a3f12',
          950: '#1a270a',
        },
        olive: {
          50: '#f7f9f1',
          100: '#e8ede3',
          200: '#d5dec3',
          300: '#bcc896',
          400: '#9fae6a',
          500: '#7e8f4a',
          600: '#6a783d',
          700: '#556133',
          800: '#434b28',
          900: '#352f1f',
          950: '#23220f',
        },
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#05070e',
        },
        accent: {
          saffron: '#ff7700',
          chakra: '#1e3a8a',
          olive: '#6fa63a',
          rose: '#f43f5e',
          amber: '#f59e0b',
          violet: '#8b5cf6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Tiro Devanagari Hindi', 'Rozha One', 'Yatra One', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-olive-white': 'linear-gradient(135deg, #6fa63a 0%, #a8c284 50%, #f5f7f2 100%)',
        'gradient-olive-dark': 'linear-gradient(135deg, #556133 0%, #7e8f4a 50%, #bcc896 100%)',
        'gradient-vertical-olive': 'linear-gradient(180deg, #f5f7f2 0%, #bcc896 100%)',
        'gradient-radial-olive': 'radial-gradient(circle, #6fa63a 0%, #556133 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
