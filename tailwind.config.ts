import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // #2563EB (blue-600)
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // #0D9488 (teal-600)
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // #EF4444 (red-500)
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // #4F46E5 (indigo-600)
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
        // Custom colors from prompt
        success: "#22C55E", // green-500
        warning: "#F59E0B", // amber-500
        // Sidebar specific colors (as per shadcn sidebar docs)
        sidebar: "hsl(var(--sidebar-background))",
        "sidebar-foreground": "hsl(var(--sidebar-foreground))",
        "sidebar-border": "hsl(var(--sidebar-border))",
        "sidebar-ring": "hsl(var(--sidebar-ring))",
        "sidebar-accent": "hsl(var(--sidebar-accent))",
        "sidebar-accent-foreground": "hsl(var(--sidebar-accent-foreground))",
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
      screens: {
        xs: "480px", // Extra small devices
        // Default Tailwind: sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
        // User specified: mobile: 640px (sm), tablet: 768px (md), desktop: 1024px (lg), large-desktop: 1280px (xl)
      },
      spacing: {
        // 8px spacing system (0.5rem = 8px)
        "0.5": "0.125rem", // 2px
        "1": "0.25rem", // 4px
        "1.5": "0.375rem", // 6px
        "2": "0.5rem", // 8px
        "2.5": "0.625rem", // 10px
        "3": "0.75rem", // 12px
        "3.5": "0.875rem", // 14px
        "4": "1rem", // 16px (base for multiples of 8)
      },
      truncate: {
        // For multi-line truncation
        "2-lines": {
          overflow: "hidden",
          display: "-webkit-box",
          "-webkit-line-clamp": "2",
          "-webkit-box-orient": "vertical",
        },
        "3-lines": {
          overflow: "hidden",
          display: "-webkit-box",
          "-webkit-line-clamp": "3",
          "-webkit-box-orient": "vertical",
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    ({ addUtilities }: { addUtilities: any }) => {
      const newUtilities = {
        ".truncate-2-lines": {
          overflow: "hidden",
          display: "-webkit-box",
          "-webkit-box-orient": "vertical",
          "-webkit-line-clamp": "2",
        },
        ".truncate-3-lines": {
          overflow: "hidden",
          display: "-webkit-box",
          "-webkit-box-orient": "vertical",
          "-webkit-line-clamp": "3",
        },
      }
      addUtilities(newUtilities, ["responsive", "hover"])
    },
  ],
} satisfies Config

export default config
