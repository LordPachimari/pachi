"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";

import { Button } from "~/components/atoms/button";
import { Input } from "~/components/atoms/input";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "~/types";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbar<TData> {
  table: Table<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  additionalToolbarButton?: React.ReactNode;
  view: "row" | "grid";
  withGridView?: boolean;
  withView?: boolean;
  onChangeView?: React.Dispatch<React.SetStateAction<"row" | "grid">>;
}
export function DataTableToolbar<TData>({
  table,
  additionalToolbarButton,
  filterableColumns,
  onChangeView,
  searchableColumns,
  view,
  withGridView = false,
  withView = true,
}: DataTableToolbar<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-1 p-1">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns &&
          searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <Input
                  key={String(column.id)}
                  placeholder={`Filter ${column.title}...`}
                  value={
                    (table
                      .getColumn(String(column.id))
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(column.id))
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-8 w-[150px] lg:w-[200px]"
                />
              ),
          )}
        {filterableColumns &&
          filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.title}
                  options={column.options}
                />
              ),
          )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      {additionalToolbarButton ?? additionalToolbarButton}
      {withView && (
        <DataTableViewOptions
          onChangeView={onChangeView}
          table={table}
          view={view}
          withGridView={withGridView}
        />
      )}
    </div>
  );
}
