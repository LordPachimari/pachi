"use client";

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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

import type { ProductVariant } from "@pachi/db";

import { Button } from "~/components/atoms/button";
import { Checkbox } from "~/components/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/atoms/dropdown-menu";
import { VariantsTable } from "./table";

interface VariantTableProps {
  data: ProductVariant[];
}

export function Table({ data }: VariantTableProps) {
  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<ProductVariant, unknown>[]>(
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
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "Variant",

        header: ({ column }) => <h3 className="text-sm ">Variant</h3>,
        cell: ({ row }) => (
          <div className="w-[50px]">
            {row.original.options && row.original.options.length > 0
              ? row.original.options.map((opt) => opt.value).join("/")
              : ""}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "Price",

        header: ({ column }) => <h3 className="text-sm ">Price</h3>,
        cell: ({ row }) => (
          <div className="w-[50px]">
            {row.original.prices && row.original.prices.length > 0
              ? row.original.prices[0]!.amount
              : ""}
            {/* <PriceAmount value={row.getValue("price")} o /> */}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "Inventory",
        header: ({ column }) => <h3 className="text-sm ">Inventory</h3>,

        cell: ({ row }) => {
          return (
            <div className="flex w-[50px] items-center justify-center">
              {row.original.inventoryQuantity ?? 0}
            </div>
          );
        },
      },
      {
        accessorKey: "sku",

        header: ({ column }) => <h3 className="text-sm ">SKU</h3>,
        cell: ({ row }) => (
          <div className="w-[50px]">{row.original.sku ?? ""}</div>
        ),
        enableSorting: false,
        enableHiding: true,
      },

      {
        accessorKey: "barcode",
        header: ({ column }) => <h3 className="text-sm ">Barcode</h3>,
        cell: ({ row }) => (
          <div className="w-[50px]">{row.original.barcode ?? ""}</div>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <DotsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Dupicate</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const productVariants = data.length > 0 ? data.slice(1) : [];

  return (
    <VariantsTable
      columns={columns}
      data={productVariants}
      view={"row"}

      // pageCount={pageCount}
    />
  );
}
