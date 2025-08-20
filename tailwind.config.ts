// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'bg-pf-black',
    'text-gold-industrial', 
    'border-pf-surface',
    'glow-primary',
    'glass-effect',
    'bg-pf-surface',
    'bg-pf-surface-light',
    'bg-pf-surface-dark',
    'text-pf-text',
    'text-pf-text-muted',
    'border-pf-border',
    'bg-pf-accent',
    'bg-pf-success',
    'bg-pf-warning',
    'bg-pf-error'
  ],
  theme: {
    container: { 
      center: true, 
      padding: "2rem", 
      screens: { "2xl": "1400px" } 
    },
    extend: {
      colors: {
        // PromptForge custom colors
        "pf-black": "#0a0a0a",
        "pf-surface": "#1a1a1a",
        "pf-surface-light": "#2a2a2a",
        "pf-surface-dark": "#0f0f0f",
        "gold-industrial": "#d4af37",
        "gold-industrial-light": "#e6c547",
        "gold-industrial-dark": "#b8941f",
        "pf-accent": "#3b82f6",
        "pf-accent-light": "#60a5fa",
        "pf-accent-dark": "#1d4ed8",
        "pf-success": "#10b981",
        "pf-warning": "#f59e0b",
        "pf-error": "#ef4444",
        "pf-text": "#ffffff",
        "pf-text-muted": "#9ca3af",
        "pf-border": "#374151",
        // Existing shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        overlay: "hsl(var(--overlay))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
