import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusIcon } from "@radix-ui/react-icons";
import type { ColumnDef } from "@tanstack/react-table";
import { isDefined, toPairs } from "remeda";

import type { Price, Product } from "@pachi/db";
import { generateId, ulid } from "@pachi/utils";

import { Table } from "~/components/table/table";
import { useTable } from "~/components/table/use-table";
import { Button } from "~/components/ui/button";
import { createUrl } from "~/libs/create-url";
import { useDashboardRep } from "~/providers/replicache/dashboard";
import { ProductStore, UserStore } from "~/replicache/stores";
import {
  filterableColumns,
  getProductsColumns,
  searchableColumns,
} from "./columns";

interface ProductsTableProps {
  perPage: number;
  page: number;
  status: Set<string>;
  title: string;
  storeId: string | undefined;
}
type Filters = Pick<ProductsTableProps, "status">;

function filter(products: Product[], filters: Filters): Product[] {
  const filterPairs = toPairs.strict(filters);
  products.filter((product) => {
    return filterPairs.every(([key, values]) => {
      if (values.size === 0) return true;
      const value = product[key];
      if (isDefined(value)) return values.has(value);
      return false;
    });
  });
  return products;
}

function ProductsTable({
  perPage,
  page,
  status,
  title,
  storeId,
}: ProductsTableProps) {
  const dashboardRep = useDashboardRep();
  const data = ProductStore.scan(dashboardRep, "p_");
  const store = UserStore.get(dashboardRep, "store");
  const searchParams = useSearchParams();

  const router = useRouter();
  // Memoize the columns so they don't re-render on every render
  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => getProductsColumns(),
    [],
  );
  const filteredData = filter(data, { status });
  const paginatedData = paginate(filteredData, { per_page: perPage, page });

  const { table } = useTable({
    columns,
    data: paginatedData,
    pageCount: Math.ceil(data.length / perPage),
    filterableColumns,
    searchableColumns,
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
        storeId,
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
