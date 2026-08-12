import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  // Enable class-based dark mode (toggled via next-themes)
  darkMode: ["class"],

  // Only process files that actually use Tailwind
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{md,mdx}",
    "./.contentlayer/generated/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── Color System (HSL variables from globals.css) ──
      colors: {
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
        // Brand-specific palette
        brand: {
          50:  "hsl(190, 72%, 96%)",
          100: "hsl(190, 74%, 91%)",
          200: "hsl(190, 76%, 82%)",
          300: "hsl(188, 78%, 70%)",
          400: "hsl(186, 78%, 56%)",
          500: "hsl(184, 82%, 43%)",
          600: "hsl(192, 92%, 30%)",
          700: "hsl(196, 78%, 24%)",
          800: "hsl(202, 62%, 20%)",
          900: "hsl(210, 48%, 16%)",
          950: "hsl(216, 38%, 10%)",
        },
      },

      // ── Border Radius (ShadCN compatible) ──
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ── Typography ──
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
        serif: ["Georgia", "Cambria", ...fontFamily.serif],
        mono: ["var(--font-jetbrains-mono)", ...fontFamily.mono],
      },

      boxShadow: {
        soft: "0 18px 45px -32px hsl(var(--foreground) / 0.32)",
        lift: "0 18px 60px -36px hsl(var(--foreground) / 0.45)",
      },

      // ── Keyframe Animations (ShadCN + custom) ──
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down":      "accordion-down 0.2s ease-out",
        "accordion-up":        "accordion-up 0.2s ease-out",
        "fade-in":             "fade-in 0.4s ease-out",
        "slide-in-from-left":  "slide-in-from-left 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        shimmer:               "shimmer 2s linear infinite",
      },

      // ── Typography Plugin ──
      typography: (theme: (arg: string) => string) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body":          theme("colors.foreground"),
            "--tw-prose-headings":      theme("colors.foreground"),
            "--tw-prose-links":         theme("colors.primary.DEFAULT"),
            "--tw-prose-code":          theme("colors.foreground"),
            "--tw-prose-pre-bg":        "hsl(var(--muted))",
            lineHeight: "1.78",
            maxWidth: "none",
            h1: {
              letterSpacing: "0",
            },
            h2: {
              marginTop: "2.4em",
              letterSpacing: "0",
            },
            h3: {
              marginTop: "2em",
              letterSpacing: "0",
            },
            code: {
              backgroundColor: "hsl(var(--muted))",
              borderRadius:    "4px",
              padding:         "2px 6px",
              fontWeight:      "400",
              fontSize:        "0.875em",
              "&::before": { content: "\"\"" },
              "&::after":  { content: "\"\"" },
            },
            pre: {
              backgroundColor: "transparent",
              padding:         "0",
              margin:          "0",
              borderRadius:    "0",
            },
          },
        },
        invert: {
          css: {
            "--tw-prose-body":     "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
          },
        },
      }),
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
};

export default config;
