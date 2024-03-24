"use client";

import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { LayoutGrid, Rows } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

type DataTableViewOptions<TData> = {
  table: Table<TData>;
  view?: "grid" | "row";
  withGridView?: boolean;
  onChangeView?:
    | React.Dispatch<React.SetStateAction<"row" | "grid">>
    | undefined;
};

export function TableViewOptions<TData>({
  table,
  onChangeView,
  view = "row",
  withGridView = false,
}: DataTableViewOptions<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 md:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
        {withGridView && (
          <>
            <DropdownMenuCheckboxItem
              className="capitalize"
              checked={view === "row"}
              onCheckedChange={(value) => {
                if (onChangeView) onChangeView(value ? "row" : "grid");
              }}
            >
              <LayoutGrid size={15} />
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className="capitalize"
              checked={view === "grid"}
              onCheckedChange={(value) => {
                if (onChangeView) onChangeView(value ? "grid" : "row");
              }}
            >
              <Rows className="" size={15} />
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
