// tailwind.config.ts
import type { Config } from "tailwindcss";

const config = {
  darkMode: "class", // sau ['class'] dacă vrei selector custom mai târziu
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:{ DEFAULT:"hsl(var(--secondary))", foreground:"hsl(var(--secondary-foreground))" },
        destructive:{ DEFAULT:"hsl(var(--destructive))", foreground:"hsl(var(--destructive-foreground))" },
        muted:{ DEFAULT:"hsl(var(--muted))", foreground:"hsl(var(--muted-foreground))" },
        accent:{ DEFAULT:"hsl(var(--accent))", foreground:"hsl(var(--accent-foreground))" },
        popover:{ DEFAULT:"hsl(var(--popover))", foreground:"hsl(var(--popover-foreground))" },
        card:{ DEFAULT:"hsl(var(--card))", foreground:"hsl(var(--card-foreground))" },

        /* SKRE Protocol Custom Colors */
        "gold-industrial": "#d1a954",
        "lead-gray": "#5a5a5a",
        "pf-black": "#0A0A0A",
        "pf-surface": "#111214",
        "pf-gray-600": "#1E1E1E",
        "pf-gray-200": "#F2F2F2",
        "pf-neon": "#39FF14",
        "pf-hazard": "#FF3131",
        /* Vector Colors */
        "vector-v1": "#f87171",
        "vector-v2": "#60a5fa",
        "vector-v3": "#34d399",
        "vector-v4": "#fbbf24",
        "vector-v5": "#a78bfa",
        "vector-v6": "#22d3ee",
        "vector-v7": "#fb923c",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Montserrat", "sans-serif"],
        sans: ["var(--font-sans)", "Open Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(10px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 0 20px rgba(209,169,84,.3)" }, "50%": { boxShadow: "0 0 40px rgba(209,169,84,.6)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4,0,0.2,1)",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      spacing: { "pf-1": "4px","pf-2": "8px","pf-3": "12px","pf-4": "16px","pf-5": "24px","pf-6": "32px","pf-7": "48px" },
      boxShadow: {
        "pf-1": "0 1px 2px rgba(0,0,0,.4)",
        "pf-2": "0 8px 24px rgba(0,0,0,.6)",
        "pf-gold": "0 0 20px rgba(209,169,84,.3)",
        "pf-gold-hover": "0 0 30px rgba(209,169,84,.5)",
      },
      backgroundImage: {
        "pf-hero": "radial-gradient(1200px 600px at 50% 0%, #10130F 0%, #0B0B0C 60%, #080809 100%)",
        "pf-hero-mobile": "radial-gradient(800px 400px at 50% 0%, #10130F 0%, #0B0B0C 60%, #080809 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
