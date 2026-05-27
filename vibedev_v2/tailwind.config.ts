// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... your existing config
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none',    /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none',            /* Chrome, Safari and Opera */
          },
        },
      });
    },
  ],
}