import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { Price } from "@pachi/db";
import { currencies, type CurrencyType } from "@pachi/types";
import { generateId, ulid } from "@pachi/utils";

import { Table } from "~/components/table/table";
import { useTable } from "~/components/table/use-table";
import { useReplicache } from "~/zustand/replicache";
import { getCurrenciesColumns } from "./columns";

interface CurrencyTableProps {
  productCurrencyCodes: string[];
  prices: Price[];
  variantId: string;
  storeId: string;
  productId: string;
  close: () => void;
}

function CurrenciesTable({
  productCurrencyCodes,
  prices,
  variantId,
  storeId,
  productId,
  close,
}: Readonly<CurrencyTableProps>) {
  const [saving, setSaving] = useState(false);
  const { globalRep, dashboardRep } = useReplicache();
  const data = Object.values(currencies);
  // Memoize the columns so they don't re-render on every render
  const columns = useMemo<ColumnDef<CurrencyType, unknown>[]>(
    () => getCurrenciesColumns(productCurrencyCodes),
    [productCurrencyCodes],
  );

  const { table } = useTable({
    columns,
    data,
  });

  useEffect(() => {
    setSaving(false);
  }, [productCurrencyCodes]);

  const saveCurrencies = useCallback(async () => {
    setSaving(true);
    const exisitingCurrencyCodesSet = new Set(
      prices.map((price) => price.currencyCode),
    );
    const priceIdsToDelete: string[] = [];
    const pricesToCreate: Price[] = [];
    const selectedRowIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.id);

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
          variantId,
          createdAt: new Date().toISOString(),
        });
    }

    await Promise.all([
      globalRep?.mutate.updateStore({
        id: storeId,
        updates: {
          currencies: selectedRowIds,
        },
      }),
      dashboardRep?.mutate.createProductPrices({
        prices: pricesToCreate,
        productId,
        variantId,
      }),
      dashboardRep?.mutate.deleteProductPrices({
        priceIds: priceIdsToDelete,
        productId: productId,
        variantId: variantId,
      }),
    ]);
    close();
  }, [
    prices,
    table,
    globalRep,
    dashboardRep,
    close,
    storeId,
    productId,
    variantId,
  ]);

  return <Table columns={columns} table={table} />;
}

export { CurrenciesTable };
