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

import type { Currency, MoneyAmount } from "@pachi/db";
import { currencies } from "@pachi/types";
import { generateId } from "@pachi/utils";

import { Button } from "~/components/atoms/button";
import { Checkbox } from "~/components/atoms/checkbox";
import { DataTableColumnHeader } from "~/components/organisms/data-table/data-table-column-header";
import { ReplicacheInstancesStore } from "~/zustand/replicache";
import { CurrenciesTable } from "./table";

interface CurrencyTableProps {
  store_currencies: string[];
  storeId: string;
  prices: MoneyAmount[];
  variantId: string;
  productId: string;
  close: () => void;
}

export function Table({
  store_currencies,
  storeId,
  prices,
  productId,
  variantId,
  close,
}: CurrencyTableProps) {
  const [selectedRowIds, setSelectedRowIds] =
    React.useState<string[]>(store_currencies);
  const [saving, setSaving] = React.useState(false);
  console.log("store_currencies", store_currencies);
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
    [store_currencies],
  );
  const saveCurrencies = React.useCallback(async () => {
    setSaving(true);
    const exisitingCurrencyCodesSet = new Set(
      prices.map((price) => price.currency_code),
    );
    const priceIdsToDelete: string[] = [];
    const pricesToCreate: MoneyAmount[] = [];

    for (const price of prices) {
      console.log("price currency code", price.currency_code);
      if (!selectedRowIds.includes(price.currency_code)) {
        priceIdsToDelete.push(price.id);
      }
    }
    for (const currencyCode of selectedRowIds) {
      if (!exisitingCurrencyCodesSet.has(currencyCode))
        pricesToCreate.push({
          id: generateId({ id: ulid(), prefix: "m_amount" }),
          amount: 0,
          currency_code: currencyCode,
          variant_id: variantId,
          created_at: new Date().toISOString(),
        });
    }
    await Promise.all([
      globalRep?.mutate.updateStore({
        args: {
          store_id: storeId,
          updates: {
            currencies: selectedRowIds,
          },
        },
      }),
      dashboardRep?.mutate.createPrices({
        args: {
          prices: pricesToCreate,
          product_id: productId,
          variant_id: variantId,
        },
      }),
      dashboardRep?.mutate.deletePrices({
        args: {
          ids: priceIdsToDelete,
          product_id: productId,
          variant_id: variantId,
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
