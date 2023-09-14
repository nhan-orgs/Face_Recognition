/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}', './load_face/**/*.{html,js}', './save_face/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        'm-blue': '#0071e3',
      },
      boxShadow: {
        main: '0 0 6px -1px rgb(0 0 0 / 0.2)',
        modal: '0 0 48px 0px rgb(0 0 0 / 0.2)',
      },
    },
  },
  plugins: [],
}
