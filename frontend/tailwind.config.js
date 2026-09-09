/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
        },
        surface: '#f5f5f5',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.12)',
        cardHover: '0 8px 24px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
}