"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import type { Table } from "@tanstack/react-table";
import { TrashIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type {
  DataTableFilterableColumn,
  DataTableSearchableColumn,
} from "~/types";
import { TableFacetedFilter } from "./faceted-filter";
import { TableViewOptions } from "./view-options";

interface DataTableToolbar<TData> {
  table: Table<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  additionalToolbarButton: React.ReactNode | undefined;
  view: "row" | "grid";
  withGridView: boolean;
  withViewToolbar?: boolean;
  onChangeView?: React.Dispatch<React.SetStateAction<"row" | "grid">>;
  deleteRowsAction: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

export function TableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  onChangeView,
  view,
  withGridView,
  withViewToolbar = true,
  deleteRowsAction,
  additionalToolbarButton,
}: Readonly<DataTableToolbar<TData>>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
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
                  className="h-8 w-[150px] lg:w-[250px]"
                />
              ),
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <TableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.title}
                  options={column.options}
                />
              ),
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {deleteRowsAction && table.getSelectedRowModel().rows.length > 0 && (
          <Button
            aria-label="Delete selected rows"
            size="sm"
            className="h-8 bg-red-500"
            onClick={(event) => {
              deleteRowsAction(event);
              table.toggleAllPageRowsSelected(false);
            }}
          >
            <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            Delete
          </Button>
        )}
        {additionalToolbarButton ?? additionalToolbarButton}
        {withViewToolbar && (
          <TableViewOptions
            onChangeView={onChangeView}
            table={table}
            view={view}
            withGridView={withGridView}
          />
        )}
      </div>
    </div>
  );
}
