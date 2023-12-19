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

import type { Product } from "@pachi/db";
import { product_status } from "@pachi/db";

import { Button } from "~/components/atoms/button";
import { Checkbox } from "~/components/atoms/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/atoms/dropdown-menu";
import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { DataTableColumnHeader } from "~/components/organisms/data-table/data-table-column-header";
import { ProductsTable } from "./table";

interface ProductTableProps {
  data: Product[];
  createProduct: () => Promise<void>;
}

export function Table({ data, createProduct }: ProductTableProps) {
  const router = useRouter();

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Product, unknown>[]>(
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
        accessorKey: "thumbnail",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Thumbnail" />
        ),
        cell: ({ row }) => (
          <div className="w-[80px]">
            <div className="my-1.5 mr-4 flex h-[40px] w-[30px] items-center">
              {row.original.thumbnail ? (
                <Image
                  src={row.original.thumbnail.url}
                  alt={row.original.thumbnail.altText || "Uploaded image"}
                  className="h-full rounded-soft object-cover"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
          </div>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          console.log("title,", row.getValue("title"));
          return <div className="w-[80px]">{row.getValue("title")}</div>;
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "collection",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Collection" />
        ),
        cell: ({ row }) => (
          <div className="w-[80px]">{row.getValue("collection")}</div>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          if (!status) {
            return null;
          }

          return (
            <div className="flex w-[100px] items-center">
              {status === "draft" ? (
                <CrossCircledIcon
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : status === "proposed" ? (
                <CheckCircledIcon
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : status === "published" ? (
                <StopwatchIcon
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : status === "rejected" ? (
                <QuestionMarkCircledIcon
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <CircleIcon
                  className="mr-2 h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
              <span className="capitalize">{status}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value instanceof Array && value.includes(row.getValue(id));
        },
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "Inventory",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Inventory" />
        ),
        cell: ({ row }) => {
          return <div className="w-[80px]"></div>;
        },
        enableSorting: false,
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
              <DropdownMenuItem>Publish</DropdownMenuItem>
              <DropdownMenuItem>Duplicacte</DropdownMenuItem>

              <DropdownMenuItem>Delete</DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  return (
    <ProductsTable
      columns={columns}
      data={data}
      view={"row"}
      // pageCount={pageCount}
      withGridView
      gridViewComponent={<div>hello from grid</div>}
      withToolbar
      additionalToolbarButton={
        <Button
          size="sm"
          className="mr-2"
          onClick={async () => await createProduct()}
        >
          <PlusIcon className="mr-1 h-4 w-4" aria-hidden="true" />
          New Product
        </Button>
      }
      filterableColumns={[
        {
          id: "status",
          title: "Status",
          options: product_status.map((status) => ({
            label: status[0]!.toUpperCase() + status.slice(1),
            value: status,
          })),
        },
        // {
        //   id: "collection",
        //   title: "Collection",
        //   options: tasks.priority.enumValues.map((priority) => ({
        //     label: priority[0]!.toUpperCase() + priority.slice(1),
        //     value: priority,
        //   })),
        // },
      ]}
      searchableColumns={[
        {
          id: "title",
          title: "Title",
        },
      ]}
    />
  );
}
