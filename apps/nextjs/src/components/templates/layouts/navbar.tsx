"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

import { useIsWindowScrolled } from "~/hooks/use-is-window-scrolled";

function Navbar(props: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isScrolled = useIsWindowScrolled();

  return (
    <header
      {...props}
      className={clsx(
        " group fixed inset-x-0 top-0 z-30 mx-auto flex items-center justify-between border border-slate-6 px-6 py-2 transition-all duration-300 hover:border dark:bg-slate-alpha-1  ",
        pathname.includes("about") && "mix-blend-difference",
        isScrolled && "dark:slate-5 border border-slate-6",
        isScrolled
          ? "mt-4 h-14 w-11/12 rounded-3xl shadow-lg md:h-14 md:w-4/5 lg:w-2/3"
          : "h-16 w-full lg:px-40 ",
      )}
    />
  );
}

export { Navbar };
