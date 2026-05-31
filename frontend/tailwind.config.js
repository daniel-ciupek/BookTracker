import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        'aurora-pink': '#E879F9',
        'aurora-indigo': '#818CF8',
        'aurora-sky': '#38BDF8',
        slate: {
          850: '#151f32',
          900: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 20px 40px rgba(0, 0, 0, 0.08)',
        glow: '0 0 20px rgba(168,85,247,0.35)',
        'glow-lg': '0 0 40px rgba(168,85,247,0.4)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
