"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// components/Sidebar.js

import { cn } from "@pachi/utils";

import { Icons } from "~/components/ui/icons";
import type { SidebarNavItem } from "~/types";

export interface DashboardSidebarProps {
  items: SidebarNavItem[];
  storeId: string;
}

const DashboardSidebar = ({ items, storeId }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "group fixed z-40 h-full w-14  overflow-hidden border-r-[1px] shadow-inner backdrop-blur-md transition-all duration-300 ease-in-out hover:w-56 md:rounded-tl-2xl",
      )}
    >
      <div className=" mt-20 flex w-full flex-col items-start gap-1 px-2 py-6">
        {items.map((item, index) => {
          const Icon = Icons[item.icon ?? "chevronLeft"];

          return item.href ? (
            <div
              key={item.title}
              className={cn(
                `flex h-10 w-full items-center gap-3 rounded-md px-2 transition-all duration-300 ease-in-out hover:bg-slate-3 `,
              )}
            >
              <Link
                key={item.title}
                href={`${item.href}?storeId=${storeId}`}
                target={item.external ? "_blank" : ""}
                rel={item.external ? "noreferrer" : ""}
                className="flex w-[350px] gap-2"
              >
                <Icon
                  className={cn(
                    "mr-2 h-6 w-6",

                    pathname === item.href || pathname.startsWith(item.href)
                      ? "text-brand"
                      : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "w-[350px] text-slate-11 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 ",

                    pathname === item.href || pathname.startsWith(item.href)
                      ? "text-brand"
                      : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </span>
              </Link>
            </div>
          ) : (
            <span
              key={index}
              className={cn(
                "text-slate-11 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 ",
              )}
            >
              {item.title}
            </span>
          );
        })}
      </div>
    </nav>
  );
};

export default DashboardSidebar;
