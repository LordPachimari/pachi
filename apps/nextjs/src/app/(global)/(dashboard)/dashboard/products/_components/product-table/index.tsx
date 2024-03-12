import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";

import type { Price, Product } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import { Table } from "~/components/table/table";
import { useTable } from "~/components/table/use-table";
import { Button } from "~/components/ui/button";
import { createUrl } from "~/libs/create-url";
import { ProductStore, UserStore } from "~/replicache/stores";
import { useReplicache } from "~/zustand/replicache";
import {
  filterableColumns,
  getProductsColumns,
  searchableColumns,
} from "./columns";

interface ProductsTableProps {
  storeId: string | undefined;
}

function ProductsTable({ storeId }: Readonly<ProductsTableProps>) {
  const { dashboardRep } = useReplicache();
  const data = ProductStore.scan(dashboardRep, "p_");
  const store = UserStore.get(dashboardRep, "store");
  const searchParams = useSearchParams();

  const router = useRouter();
  // Memoize the columns so they don't re-render on every render
  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => getProductsColumns(),
    [],
  );

  const { table } = useTable({
    columns,
    data,
  });

  const createProduct = useCallback(async () => {
    if (dashboardRep && storeId && store) {
      const defaultVariantId = generateId({
        id: ulid(),
        prefix: "default_var",
      });
      const id = generateId({
        id: ulid(),
        prefix: "p",
        filterId: storeId,
      });

      await dashboardRep.mutate.createProduct({
        product: {
          id,
          createdAt: new Date().toISOString(),
          status: "draft",
          discountable: true,
          defaultVariantId,
          storeId,
          version: 0,
        },
        prices: (store.currencies ?? []).map((currencyCode) => {
          const price: Price = {
            id: generateId({ id: ulid(), prefix: "price" }),
            currencyCode,
            amount: 0,
            variantId: defaultVariantId,
          };

          return price;
        }),
      });
      router.push(createUrl(`/dashboard/products/${id}`, searchParams));
    }
  }, [dashboardRep, router, storeId, searchParams, store]);

  return (
    <Table
      columns={columns}
      withGridView={true}
      gridViewComponent={<div></div>}
      table={table}
      filterableColumns={filterableColumns}
      searchableColumns={searchableColumns}
      withToolbar={true}
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
    />
  );
}

export { ProductsTable };
