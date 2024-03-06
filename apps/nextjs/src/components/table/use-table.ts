'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'

import { useBuildExistingQueryOption, useQueryOptions } from '~/routing/router'

interface UseDataTableProps<TData, TValue> {
  /**
   * The data for the table
   * @default []
   * @type TData[]
   */
  data: TData[]

  /**
   * The columns of the table
   * @default []
   * @type ColumnDef<TData, TValue>[]
   */
  columns: ColumnDef<TData, TValue>[]
}

function useTable<TData, TValue>({
  data,
  columns,
}: UseDataTableProps<TData, TValue>) {
  const router = useRouter()
  const params = useSearchParams()
  const queryOptions = useQueryOptions(params)

  // Search params
  const page = queryOptions.page[0] ?? '1'
  const pageAsNumber = Number(page)
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber
  const pageSize_ = queryOptions.pageSize[0] ?? '1'
  const pageSizeAsNumber = Number(pageSize_)
  const fallbackPageSize = isNaN(pageSizeAsNumber) ? 10 : pageSizeAsNumber

  const buildQueryOption = useBuildExistingQueryOption()

  // Table states
  const [rowSelection, setRowSelection] = React.useState({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPageSize,
    })

  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  )

  React.useEffect(() => {
    setPagination({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPage,
    })
  }, [fallbackPage, fallbackPageSize])

  React.useEffect(() => {
    router.push(
      buildQueryOption({
        page: [String(pageIndex + 1)],
        pageSize: [String(pageSize)],
      }),
      {
        scroll: false,
      },
    )
  }, [pageIndex, pageSize, buildQueryOption, router])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
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
  })

  return { table }
}
export { useTable }
