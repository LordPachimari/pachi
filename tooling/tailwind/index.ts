import uiPreset from "@medusajs/ui-preset";
import tailwindContainerQueries from "@tailwindcss/container-queries";
import pluginForm from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],

  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  variants: {
    extends: {
      opacity: ["group-hover"],
      visibility: ["group-hover"],
      translate: ["group-hover"],
    },
  },
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
        background: "var(--background)",
        navbar: "var(--navbar)",
        component: "var(--component)",
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
        vice: {
          start: "#7C53FF",
          stop: "#F796FF",
        },
        brand: "var(--brand)",
        crimson: {
          1: "var(--crimson-a1)",
          2: "var(--crimson-a2)",
          3: "var(--crimson-a3)",
          4: "var(--crimson-a4)",
          5: "var(--crimson-a5)",
          6: "var(--crimson-a6)",
          7: "var(--crimson-a7)",
          8: "var(--crimson-a8)",
          9: "var(--crimson-a9)",
          10: "var(--crimson-a10)",
          11: "var(--crimson-a11)",
          12: "var(--crimson-a12)",
        },
        ruby: {
          1: "var(--ruby-a1)",
          2: "var(--ruby-a2)",
          3: "var(--ruby-a3)",
          4: "var(--ruby-a4)",
          5: "var(--ruby-a5)",
          6: "var(--ruby-a6)",
          7: "var(--ruby-a7)",
          8: "var(--ruby-a8)",
          9: "var(--ruby-a9)",
          10: "var(--ruby-a10)",
          11: "var(--ruby-a11)",
          12: "var(--ruby-a12)",
        },
        "slate-alpha": {
          1: "var(--slate-a1)",
          2: "var(--slate-a2)",
          3: "var(--slate-a3)",
          4: "var(--slate-a4)",
          5: "var(--slate-a5)",
          6: "var(--slate-a6)",
          7: "var(--slate-a7)",
          8: "var(--slate-a8)",
          9: "var(--slate-a9)",
          10: "var(--slate-a10)",
          11: "var(--slate-a11)",
          12: "var(--slate-a12)",
        },
        slate: {
          1: "var(--slate-1)",
          2: "var(--slate-2)",
          3: "var(--slate-3)",
          4: "var(--slate-4)",
          5: "var(--slate-5)",
          6: "var(--slate-6)",
          7: "var(--slate-7)",
          8: "var(--slate-8)",
          9: "var(--slate-9)",
          10: "var(--slate-10)",
          11: "var(--slate-11)",
          12: "var(--slate-12)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
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

        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.9)", opacity: "0" },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: "fadeIn .3s ease-in-out",
        carousel: "marquee 60s linear infinite",
        blink: "blink 1.4s both infinite",
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
      height: {
        "product-page": "calc(100vh - 100px)",
        "product-input": "calc(100vh - 100px - 70px)",
        currencies: "calc(100vh -  100px)",
        18: "4.5rem",
        content: "calc(100vh - 56px)",
        "user-products": "calc(100vh - 100px)",
      },
      minHeight: {
        product: "calc(100vh - 100px)",
        topbar: "56px",
        content: "calc(100vh - 56px)",
        "radix-accodion": "var(--radix-accordion-content-height)",
      },
      maxHeight: {
        content: "calc(100vh - 56px)",
      },
      width: {
        "with-sidebar": "calc(100vw  - 256px)",
        largeModal: "750px",
        18: "4.5rem",
        29: "7.25rem",
        content: "calc(100vw - 56px)",
        inherit: "inherit",
        eventButton: "127px",
        "product-overview": "calc(100% - 600px)",
      },
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      minWidth: {
        modal: "520px",
        sidebar: "240px",
      },
      maxWidth: {
        sidebar: "240px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
        mono: ["Roboto Mono", "Menlo", "monospace"],
      },
      screens: {
        xsmall: "0px",
        small: "769px",
        medium: "1025px",
        large: "1464px",
      },
      boxShadow: {
        cta: "0px 0px 0px 4px rgba(124, 58, 237, 0.1)",
        dropdown: "0px 2px 16px rgba(0, 0, 0, 0.08);",
        input: "0px 0px 0px 4px #8B5CF61A",
        searchModal: "0px 2px 64px 16px rgba(17, 24, 39, 0.08)",
        toaster: "0px 2px 16px rgba(17, 24, 39, 0.08)",
        border: "0px 0px 0px 1px #E5E7EB",
        "focus-border": "0px 0px 0px 1px #7C3AED",
        "error-border": "0px 0px 0px 1px #F43F5E",
        "input-shadow": "var(--input-shadow)",
      },
      lineClamp: {
        "[var(--lines)]": "var(--lines)",
      },
    },
  },
  presets: [uiPreset],
  plugins: [
    tailwindTypography,
    //@ts-ignore
    tailwindContainerQueries,
    tailwindAnimate,
    pluginForm({ strategy: "class" }),

    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          "animation-delay": (value) => {
            return {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              "animation-delay": value,
            };
          },
        },
        {
          values: theme("transitionDelay")!,
        },
      );
    }),
  ],
} satisfies Config;
