/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
"use client";

import * as React from "react";
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
import { Loader2, Loader2Icon } from "lucide-react";
import { ulid } from "ulid";
import { set } from "zod";

import type { Currency, Price } from "@pachi/db";
import { currencies } from "@pachi/types";
import { generateId } from "@pachi/utils";

import { Button } from "~/components/atoms/button";
import { Checkbox } from "~/components/atoms/checkbox";
import { DataTableColumnHeader } from "~/components/organisms/data-table/data-table-column-header";
import { ReplicacheInstancesStore } from "~/zustand/replicache";
import { CurrenciesTable } from "./table";

interface CurrencyTableProps {
  storeCurrencies: string[];
  storeId: string;
  prices: Price[];
  variantId: string;
  productId: string;
  close: () => void;
}

export function Table({
  storeCurrencies,
  storeId,
  prices,
  productId,
  variantId,
  close,
}: CurrencyTableProps) {
  const [selectedRowIds, setSelectedRowIds] =
    React.useState<string[]>(storeCurrencies);
  const [saving, setSaving] = React.useState(false);
  console.log("storeCurrencies", storeCurrencies);
  console.log("selectedRowIds", selectedRowIds);
  const globalRep = ReplicacheInstancesStore((state) => state.globalRep);
  const dashboardRep = ReplicacheInstancesStore((state) => state.dashboardRep);
  const currencyData = Object.values(currencies);

  // Memoize the columns so they don't re-render on every render
  const columns = React.useMemo<ColumnDef<Currency, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => <></>,
        cell: ({ row }) => (
          <Checkbox
            defaultChecked={selectedRowIds.includes(row.original.code)}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              setSelectedRowIds((prev) =>
                value
                  ? [...prev, row.original.code]
                  : prev.filter((code) => code !== row.original.code),
              );
            }}
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
    [storeCurrencies],
  );
  const saveCurrencies = React.useCallback(async () => {
    setSaving(true);
    const exisitingCurrencyCodesSet = new Set(
      prices.map((price) => price.currencyCode),
    );
    const priceIdsToDelete: string[] = [];
    const pricesToCreate: Price[] = [];

    for (const price of prices) {
      if (!selectedRowIds.includes(price.currencyCode)) {
        priceIdsToDelete.push(price.id);
      }
    }
    for (const currencyCode of selectedRowIds) {
      if (!exisitingCurrencyCodesSet.has(currencyCode))
        pricesToCreate.push({
          id: generateId({ id: ulid(), prefix: "price" }),
          amount: 0,
          currencyCode: currencyCode,
          variantId: variantId,
          createdAt: new Date().toISOString(),
        });
    }
    await Promise.all([
      globalRep?.mutate.updateStore({
        args: {
          storeId: storeId,
          updates: {
            currencies: selectedRowIds,
          },
        },
      }),
      dashboardRep?.mutate.createPrices({
        args: {
          prices: pricesToCreate,
          productId: productId,
          variantId: variantId,
        },
      }),
      dashboardRep?.mutate.deletePrices({
        args: {
          ids: priceIdsToDelete,
          productId: productId,
          variantId: variantId,
        },
      }),
    ]);
    setSaving(false);
    close();
  }, [
    prices,
    selectedRowIds,
    globalRep,
    dashboardRep,
    storeId,
    productId,
    variantId,
    close,
  ]);

  return (
    <CurrenciesTable
      columns={columns}
      data={currencyData}
      view={"row"}
      // pageCount={pageCount}
      withToolbar
      additionalToolbarButton={
        <Button disabled={saving} onClick={saveCurrencies}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
        </Button>
      }
      searchableColumns={[
        {
          id: "code",
          title: "code",
        },
      ]}
    />
  );
}
