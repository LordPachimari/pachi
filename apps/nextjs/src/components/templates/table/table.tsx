import * as React from "react";
import type { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  Table as TableComponent,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "~/types";
import { TableFloatingBar } from "./floating-bar";
import { TablePagination } from "./pagination";
import { TableToolbar } from "./toolbar";

type TableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  table: TanstackTable<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  withToolbar?: boolean;
  additionalToolbarButton?: React.ReactNode;
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>;
  view?: "row" | "grid";
  floatingBarContent?: React.ReactNode | null;
  withGridView?: boolean;
  gridViewComponent?: React.ReactNode;
};

export function Table<TData, TValue>({
  columns,
  table,
  filterableColumns = [],
  searchableColumns = [],
  view: initialView = "row",
  gridViewComponent,
  deleteRowsAction,
  withGridView = false,
  withToolbar = false,
  additionalToolbarButton,
  floatingBarContent,
}: Readonly<TableProps<TData, TValue>>) {
  const [view, setView] = React.useState<"row" | "grid">("row");

  React.useEffect(() => {
    setView(initialView);
  }, [initialView]);

  return (
    <div className="space-y-4">
      {withToolbar && (
        <TableToolbar
          table={table}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
          deleteRowsAction={deleteRowsAction}
          view={view}
          additionalToolbarButton={additionalToolbarButton}
          withGridView={withGridView}
        />
      )}
      <div className="rounded-md border">
        <TableComponent>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {view === "row" && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : view === "grid" && table.getRowModel().rows.length ? (
              gridViewComponent
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableComponent>
      </div>
      <div className="space-y-2.5">
        <TablePagination table={table} />
        {floatingBarContent ? (
          <TableFloatingBar table={table}>
            {floatingBarContent}
          </TableFloatingBar>
        ) : null}
      </div>
    </div>
  );
}
