import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Extended design tokens
        success: {
          DEFAULT:    "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT:    "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        gold: "#f59e0b",
        navy: {
          900: "#0a0f1e",
          800: "#0d1424",
          700: "#111827",
          600: "#1e293b",
          500: "#1e2d45",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)" },
          "50%":      { boxShadow: "0 0 0 8px rgba(59, 130, 246, 0)" },
        },
        "pulse-red": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.5)" },
          "70%":      { boxShadow: "0 0 0 6px rgba(239, 68, 68, 0)"  },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)",    opacity: "1" },
          to:   { transform: "translateX(100%)", opacity: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)"    },
        },
      },
      animation: {
        "accordion-down":   "accordion-down 0.2s ease-out",
        "accordion-up":     "accordion-up 0.2s ease-out",
        "shimmer":          "shimmer 1.6s ease-in-out infinite",
        "pulse-glow":       "pulse-glow 2s ease-in-out infinite",
        "pulse-red":        "pulse-red 1.8s ease-in-out infinite",
        "slide-in-right":   "slide-in-right 0.35s ease-out",
        "slide-out-right":  "slide-out-right 0.3s ease-in",
        "fade-in-up":       "fade-in-up 0.4s ease-out",
      },
      backgroundImage: {
        "gradient-radial":       "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":        "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "card-gradient":         "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)",
        "hero-gradient":         "radial-gradient(ellipse at top, rgba(59,130,246,0.15) 0%, transparent 60%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
