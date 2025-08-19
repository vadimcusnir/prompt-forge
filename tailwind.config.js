/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Previne purge pentru clasele critice de background
      safelist: [
        // Motion control
        'motion-off',
        
        // Background layers - CRITICE pentru funcționarea app-ului
        'bg-root',
        'bg-gradient', 
        'bg-noise',
        'bg-grid',
        'bg-anim',
        'bg-fixed-root',
        
        // Animation states
        'matrix-animations-ready',
        
        // Opacity utilities
        'opacity-4',
        'opacity-5',
        'opacity-60',
        
        // Position utilities
        'absolute',
        'inset-0',
        'fixed',
        'z-[-1]',
        'z-0',
        'z-1',
        
        // Pointer events
        'pointer-events-none',
        
        // Glass effect utilities
        'glass-effect',
        'proof-bar',
        'backdrop-blur-sm',
        'backdrop-blur-md',
        'backdrop-blur-lg',
        
        // Opacity utilities
        'opacity-90',
        'opacity-95',
      ],
    },
  },
  plugins: [],
}
