import uiPreset from "@medusajs/ui-preset";
import tailwindContainerQueries from "@tailwindcss/container-queries";
import pluginForm from "@tailwindcss/forms";
import tailwindTypography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
const plugins = [
  tailwindTypography,
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
];
if (tailwindContainerQueries.config) {
  tailwindContainerQueries.config;
  plugins.push({
    ...tailwindContainerQueries,
    config: tailwindContainerQueries.config,
  });
}
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
        fadeIn: "fadeIn .3s ease-in-out",
        blink: "blink 1.4s both infinite",
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
      },
      boxShadow: {
        border: "0px 0px 0px 1px #E5E7EB",
        "focus-border": "0px 0px 0px 1px #7C3AED",
        "error-border": "0px 0px 0px 1px #F43F5E",
        "input-shadow": "var(--input-shadow)",
      },
    },
  },
  presets: [uiPreset],
  plugins,
} satisfies Config;
