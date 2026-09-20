function themeColor(rgbVar, fallbackRgb, defaultHex) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${rgbVar}, ${fallbackRgb}), ${opacityValue})`
    }
    return `var(${rgbVar.replace('-rgb', '')}, ${defaultHex})`
  }
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        alura: {
          background: themeColor("--alura-bg-rgb", "0, 22, 9", "#001609"),
          navigation: themeColor("--alura-navigation-rgb", "0, 27, 11", "#001B0B"),
          surface1: themeColor("--alura-surface1-rgb", "0, 27, 11", "#001B0B"),
          surface2: themeColor("--alura-surface2-rgb", "0, 34, 14", "#00220E"),
          surface3: themeColor("--alura-surface3-rgb", "0, 42, 18", "#002A12"),
          hover: themeColor("--alura-hover-rgb", "0, 48, 20", "#003014"),
          selected: "var(--alura-selected, rgba(0, 230, 160, 0.15))",
          border: themeColor("--alura-border-rgb", "0, 80, 34", "#005022"),
          borderStrong: themeColor("--alura-border-strong-rgb", "0, 201, 138", "#00C98A"),
          accent: themeColor("--alura-accent-rgb", "0, 230, 160", "#00E6A0"),
          accentBright: themeColor("--alura-accent-bright-rgb", "57, 255, 136", "#39FF88"),
          greenMuted: "var(--alura-accent-muted, rgba(0, 230, 160, 0.12))",
          greenSoft: "var(--alura-accent-soft, rgba(0, 230, 160, 0.25))",
          textPrimary: themeColor("--alura-text-primary-rgb", "242, 255, 248", "#F2FFF8"),
          textSecondary: themeColor("--alura-text-secondary-rgb", "184, 206, 194", "#B8CEC2"),
          textMuted: themeColor("--alura-text-muted-rgb", "120, 148, 135", "#789487"),
          textDisabled: themeColor("--alura-text-disabled-rgb", "73, 99, 86", "#496356"),
          success: "#00E6A0",
          warning: "#D9B84A",
          danger: "#FF5C6C",
          info: "#58A6FF",
          voice: "#7CF7C0",
          ai: "#8B7CFF",
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
