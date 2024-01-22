"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
} from "@tanstack/react-table";

import { useDebounce } from "~/hooks/use-debounce";
import {
  useBuildExistingQueryOption,
  useQueryOptions,
  type UseBuildQueryOptionParams,
} from "~/routing/router";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "~/types";

interface UseDataTableProps<TData, TValue> {
  /**
   * The data for the table
   * @default []
   * @type TData[]
   */
  data: TData[];

  /**
   * The columns of the table
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * The number of pages in the table
   * @type number
   */
  pageCount: number;

  /**
   * The searchable columns of the table
   * @default []
   * @type {id: keyof TData, title: string}[]
   * @example searchableColumns={[{ id: "title", title: "titles" }]}
   */
  searchableColumns?: DataTableSearchableColumn<TData>[];

  /**
   * The filterable columns of the table. When provided, renders dynamic faceted filters, and the advancedFilter prop is ignored.
   * @default []
   * @type {id: keyof TData, title: string, options: { label: string, value: string, icon?: React.ComponentType<{ className?: string }> }[]
   * @example filterableColumns={[{ id: "status", title: "Status", options: ["todo", "in-progress", "done", "canceled"]}]}
   */
  filterableColumns?: DataTableFilterableColumn<TData>[];
}

function useTable<TData, TValue>({
  data,
  columns,
  pageCount,
  searchableColumns = [],
  filterableColumns = [],
}: UseDataTableProps<TData, TValue>) {
  const router = useRouter();
  const params = useSearchParams();
  const queryOptions = useQueryOptions(params);
  const keys = Object.entries(queryOptions)
    .filter(([_, value]) => value.length > 0)
    .map(([key]) => key);

  // Search params
  const page = queryOptions.page[0] ?? "1";
  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const perPage = queryOptions.per_page[0] ?? "1";
  const perPageAsNumber = Number(perPage);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;

  const buildQueryOption = useBuildExistingQueryOption();

  // Table states
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage,
    });

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  React.useEffect(() => {
    setPagination({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPage,
    });
  }, [fallbackPage, fallbackPerPage]);

  React.useEffect(() => {
    router.push(
      buildQueryOption({
        page: [String(pageIndex + 1)],
        per_page: [String(pageSize)],
      }),
      {
        scroll: false,
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);



  const filteredSearchableColumns = JSON.parse(
    useDebounce(
      JSON.stringify(
        columnFilters.filter((filter) => {
          return searchableColumns.find((column) => column.id === filter.id);
        }),
      ),
      500,
    ),
  ) as ColumnFiltersState;

  const filterableColumnFilters = columnFilters.filter((filter) => {
    return filterableColumns.find((column) => column.id === filter.id);
  });

  React.useEffect(() => {
    // Initialize new params
    const newParamsObject: UseBuildQueryOptionParams = {
      page: ["1"],
    };

    // Get all values
    for (const column of filteredSearchableColumns) {
      if (typeof column.value === "string") {
        Object.assign(newParamsObject, {
          [column.id]: column.value,
        });
      }
    }

    // Remove deleted values
    for (const key of keys) {
      if (
        searchableColumns.find((column) => column.id === key) &&
        !filteredSearchableColumns.find((column) => column.id === key)
      ) {
        Object.assign(newParamsObject, { [key]: [] });
      }
    }

    router.push(buildQueryOption(newParamsObject));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filteredSearchableColumns)]);

  React.useEffect(() => {
    // Initialize new params
    const newParamsObject: UseBuildQueryOptionParams = {
      page: ["`"],
    };

    for (const column of filterableColumnFilters) {
      if (typeof column.value === "object" && Array.isArray(column.value)) {
        Object.assign(newParamsObject, { [column.id]: column.value.join(".") });
      }
    }

    for (const key of keys) {
      if (
        filterableColumns.find((column) => column.id === key) &&
        !filterableColumnFilters.find((column) => column.id === key)
      ) {
        Object.assign(newParamsObject, { [key]: [] });
      }
    }

    router.push(buildQueryOption(newParamsObject));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterableColumnFilters)]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  return { table };
}
export { useTable };