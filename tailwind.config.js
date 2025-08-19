/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './types/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Previne purge pentru clasele critice
      safelist: [
        'motion-off',
        'bg-anim',
        'matrix-animations-ready',
        'bg-fixed-root',
        'bg-grid',
        'bg-noise',
      ],
    },
  },
  plugins: [],
}
