"use client";

import Image from "next/image";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleIcon } from "lucide-react";

import type { Client } from "@pachi/validators";

import ImagePlaceholder from "~/components/molecules/image-placeholder";
import { TableColumnHeader } from "~/components/table/column-header";
import { DataTableRowActions } from "~/components/table/row-actions";
import { Checkbox } from "~/components/ui/checkbox";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "~/types";

function StatusIcon({ status }: { status: Client.Product["status"] }) {
  return status === "draft" ? (
    <CrossCircledIcon
      className="mr-2 h-4 w-4 text-muted-foreground"
      aria-hidden="true"
    />
  ) : status === "published" ? (
    <StopwatchIcon
      className="mr-2 h-4 w-4 text-muted-foreground"
      aria-hidden="true"
    />
  ) : (
    <CircleIcon
      className="mr-2 h-4 w-4 text-muted-foreground"
      aria-hidden="true"
    />
  );
}

export function getProductsColumns(): ColumnDef<Client.Product, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
        <TableColumnHeader column={column} title="Thumbnail" />
      ),
      cell: ({ row }) => (
        <div className="w-[80px]">
          <div className="my-1.5 mr-4 flex h-[40px] w-[30px] items-center">
            {row.original.thumbnail ? (
              <Image
                src={row.original.thumbnail.url}
                alt={row.original.thumbnail.altText || "Uploaded image"}
                width={100}
                height={80}
                className="rounded-soft h-full object-cover"
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
        <TableColumnHeader column={column} title="Title" />
      ),
      cell: (info) => {
        return <div className="w-[80px]">{info.getValue() as string}</div>;
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "collection",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Collection" />
      ),
      cell: ({ row }) => (
        <div className="w-[80px]">{row.original.collection?.handle}</div>
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;

        if (!status) {
          return null;
        }

        return (
          <div className="flex w-[100px] items-center">
            <StatusIcon status={status} />
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
      accessorKey: "quantity",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Quantity" />
      ),
      cell: (info) => {
        return <div className="w-[80px]">{info.getValue() as number}</div>;
      },

      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ];
}
export const filterableColumns: DataTableFilterableColumn<Client.Product>[] = [
  {
    id: "status",
    title: "Status",
    //TODO: GET ENUM
    options: ["draft", "published"].map((status) => ({
      label: status[0]?.toUpperCase() + status.slice(1),
      value: status,
    })),
  },
];
export const searchableColumns: DataTableSearchableColumn<Client.Product>[] = [
  {
    id: "title",
    title: "titles",
  },
];
