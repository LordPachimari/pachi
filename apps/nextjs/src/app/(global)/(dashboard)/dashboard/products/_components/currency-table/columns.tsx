import type { ColumnDef } from '@tanstack/react-table'

import type { CurrencyType } from '@pachi/types'

import { TableColumnHeader } from '~/components/table/column-header'
import { Checkbox } from '~/components/ui/checkbox'

export function getCurrenciesColumns(
  productCurrencyCodes: string[],
): ColumnDef<CurrencyType, unknown>[] {
  return [
    {
      id: 'select',
      header: () => <></>,
      cell: ({ row }) => (
        <Checkbox
          defaultChecked={productCurrencyCodes.includes(row.original.code)}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Code" />
      ),
      cell: ({ row }) => {
        return <div className="w-[80px]">{row.getValue(row.id)}</div>
      },
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => <div className="w-[80px]">{row.getValue(row.id)}</div>,
      enableSorting: true,
      enableHiding: true,
    },
  ]
}
