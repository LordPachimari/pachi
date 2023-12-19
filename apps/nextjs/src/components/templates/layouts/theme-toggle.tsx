"use client";

import { useTheme } from "next-themes";

import { Icons } from "~/components/atoms/icons";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="group flex h-18 w-18 flex-col items-center justify-center text-sm   "
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Icons.sun
        className="h-5 w-5 rotate-0 scale-100 text-slate-11 transition-all group-hover:text-slate-9 dark:-rotate-90 dark:scale-0"
        aria-hidden="true"
      />
      <Icons.moon
        className="absolute h-5 w-5 rotate-90 scale-0 text-slate-11 transition-all group-hover:text-slate-9 dark:rotate-0 dark:scale-100"
        aria-hidden="true"
      />
      <span className="sr-only ">Toggle theme</span>
    </button>
  );
}
