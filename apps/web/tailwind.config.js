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
        bg: 'var(--bg)',
        field: 'var(--field)',
        side: 'var(--side)',
        card: 'var(--card)',
        'card-2': 'var(--card-2)',
        line: 'var(--line)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-soft': 'var(--accent-soft)',
        'on-accent': 'var(--on-accent)',
        online: 'var(--online)',
        away: 'var(--away)',
        dnd: 'var(--dnd)',
        off: 'var(--off)',
        alura: {
          background: themeColor("--alura-bg-rgb", "12, 14, 13", "#0c0e0d"),
          navigation: themeColor("--alura-navigation-rgb", "16, 19, 18", "#101312"),
          surface1: themeColor("--alura-surface1-rgb", "22, 25, 24", "#161918"),
          surface2: themeColor("--alura-surface2-rgb", "29, 33, 32", "#1d2120"),
          surface3: themeColor("--alura-surface3-rgb", "29, 33, 32", "#1d2120"),
          hover: themeColor("--alura-hover-rgb", "29, 33, 32", "#1d2120"),
          selected: "var(--alura-selected, rgba(45, 255, 122, 0.12))",
          border: themeColor("--alura-border-rgb", "35, 40, 38", "#232826"),
          borderStrong: themeColor("--alura-border-strong-rgb", "45, 255, 122", "#2dff7a"),
          accent: themeColor("--alura-accent-rgb", "45, 255, 122", "#2dff7a"),
          accentBright: themeColor("--alura-accent-bright-rgb", "45, 255, 122", "#2dff7a"),
          greenMuted: "var(--alura-accent-muted, rgba(45, 255, 122, 0.12))",
          greenSoft: "var(--alura-accent-soft, rgba(45, 255, 122, 0.12))",
          textPrimary: themeColor("--alura-text-primary-rgb", "242, 245, 243", "#f2f5f3"),
          textSecondary: themeColor("--alura-text-secondary-rgb", "143, 154, 149", "#8f9a95"),
          textMuted: themeColor("--alura-text-muted-rgb", "143, 154, 149", "#8f9a95"),
          textDisabled: themeColor("--alura-text-disabled-rgb", "85, 93, 89", "#555d59"),
          success: "var(--online, #3ddc84)",
          warning: "var(--away, #f5c451)",
          danger: "var(--dnd, #ff6b6b)",
          info: "#58A6FF",
          voice: "var(--accent, #2dff7a)",
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
