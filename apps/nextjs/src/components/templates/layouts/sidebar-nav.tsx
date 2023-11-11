"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@pachi/utils";

import { Icons } from "~/components/atoms/icons";
import type { SidebarNavItem } from "~/types";
import { Button } from "../../atoms/button";

export interface SidebarNavProps {
  items: SidebarNavItem[];
  toggleShowSidebar: () => void;
}

export function SidebarNav({ items, toggleShowSidebar }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) return null;

  return (
    <div className="z-100 flex w-full flex-col gap-2">
      <div className="flex justify-end ">
        <Button
          size="icon"
          variant="ghost"
          className="bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-300"
          onClick={() => toggleShowSidebar()}
        >
          <Menu className="text-fuchsia-500 dark:text-fuchsia-600" />
        </Button>
      </div>

      {items.map((item, index) => {
        const Icon = Icons[item.icon ?? "chevronLeft"];

        return item.href ? (
          <Link
            key={index}
            href={item.href}
            target={item.external ? "_blank" : ""}
            rel={item.external ? "noreferrer" : ""}
          >
            <span
              className={cn(
                "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:bg-muted hover:text-foreground",
                pathname === item.href
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground",
                item.disabled && "pointer-events-none opacity-60",
              )}
            >
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>{item.title}</span>
            </span>
          </Link>
        ) : (
          <span
            key={index}
            className="flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline"
          >
            {item.title}
          </span>
        );
      })}
    </div>
  );
}
