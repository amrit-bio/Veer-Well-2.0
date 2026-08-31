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
        // Military & Tactical Olive Green Palette for CAPF / CRPF / Armed Forces
        olive: {
          50: '#f7f9f5',
          100: '#edf2e8',
          200: '#dae5d3',
          300: '#bfd2b4',
          400: '#9db990',
          500: '#7a9e6b',
          600: '#5e804f',
          700: '#4a653e',
          800: '#3c5233',
          900: '#263720',
          950: '#141e11',
        },
        camo: {
          dark: '#141d11',
          mid: '#23321d',
          light: '#394e30',
          border: '#4d6942',
        },
        brand: {
          50: '#f4f8f3',
          100: '#e5efe3',
          200: '#cce0c7',
          300: '#a6caa0',
          400: '#7aad72',
          500: '#57914e',
          600: '#42743a',
          700: '#355c2f',
          800: '#2d4b28',
          900: '#263e23',
          950: '#111f10',
        },
        navy: {
          800: '#182416',
          900: '#121c10',
          950: '#0c140b',
        },
        accent: {
          gold: '#eab308',
          saffron: '#f97316',
          emerald: '#10b981',
          crimson: '#e11d48',
          cyan: '#06b6d4',
          khaki: '#d4a373',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        devanagari: ['Tiro Devanagari Hindi', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}

