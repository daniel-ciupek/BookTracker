/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 20px 40px rgba(0, 0, 0, 0.08)',
      },
      colors: {
        slate: {
          850: '#151f32',
          900: '#0f172a',
        }
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
