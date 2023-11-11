/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
// import {
//   ArrowDownIcon,
//   ArrowRightIcon,
//   ArrowUpIcon,
//   CheckCircledIcon,
//   CircleIcon,
//   CrossCircledIcon,
//   DotsHorizontalIcon,
//   QuestionMarkCircledIcon,
//   StopwatchIcon,
// } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleIcon, PlusIcon } from "lucide-react";

import type {
  Currency,
  Image as ImageType,
  Product,
  ProductVariant,
} from "@pachi/db";
import { product_status } from "@pachi/db";
import { currencies } from "@pachi/types";

import { Button } from "~/components/atoms/button";
import { Checkbox } from "~/components/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/atoms/dropdown-menu";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/organisms/data-table/data-table-column-header";
import { CurrenciesTable } from "./table";

interface CurrencyTableProps {
  store_currencies: Currency[];
}

export function Table({ store_currencies }: CurrencyTableProps) {
  const my_currencies = new Set(store_currencies.map((s) => s.code));
  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Currency, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={my_currencies.has(row.original.code)}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Code" />
        ),
        cell: ({ row }) => {
          return <div className="w-[80px]">{row.getValue("code")}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <div className="w-[80px]">{row.getValue("name")}</div>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      // {
      //   accessorKey: "Inventory",
      //   header: ({ column }) => (
      //     <DataTableColumnHeader column={column} title="Inventory" />
      //   ),
      //   cell: ({ row }) => (
      //     <div className="w-[80px]">{row.getValue("inventory")}</div>
      //   ),
      //   enableSorting: false,
      //   enableHiding: true,
      // },
    ],
    [],
  );

  return (
    <CurrenciesTable
      columns={columns}
      data={Object.values(currencies)}
      view={"row"}
      // pageCount={pageCount}
      withToolbar
      additionalToolbarButton={<></>}
      searchableColumns={[
        {
          id: "name",
          title: "name",
        },
        {
          id: "code",
          title: "code",
        },
      ]}
    />
  );
}
