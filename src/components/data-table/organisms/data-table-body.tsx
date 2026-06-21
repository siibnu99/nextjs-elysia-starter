import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ColumnHeader } from "../molecules/column-header"
import { SelectCheckbox } from "../atoms/select-checkbox"
import { TableCell as DataTableCell } from "../atoms/table-cell"
import { TableHeaderCell } from "../atoms/table-header-cell"

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableBodyProps<T> {
  data: T[]
  columns: Column<T>[]
  enableSelection?: boolean
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (column: string, order: "asc" | "desc") => void
  density?: "compact" | "normal" | "spacious"
  getRowId?: (row: T) => string
}

const densityClasses = {
  compact: "py-1",
  normal: "py-3",
  spacious: "py-5",
}

export function DataTableBody<T>({
  data,
  columns,
  enableSelection,
  selectedRows = [],
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  density = "normal",
  getRowId,
}: DataTableBodyProps<T>) {
  function isSelected(row: T): boolean {
    if (!getRowId) return selectedRows.includes(row)
    const rowId = getRowId(row)
    return selectedRows.some((r) => getRowId(r) === rowId)
  }

  function handleSelectRow(row: T, checked: boolean) {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange([...selectedRows, row])
    } else {
      onSelectionChange(selectedRows.filter((r) => r !== row))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {enableSelection && (
            <TableHead className="w-10">
              {/* Checkbox handled in toolbar */}
            </TableHead>
          )}
          {columns.map((column) => (
            <ColumnHeader
              key={column.key}
              column={column}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={getRowId?.(row) ?? i}>
            {enableSelection && (
              <TableCell className="w-10">
                <SelectCheckbox
                  checked={isSelected(row)}
                  onChange={(checked) => handleSelectRow(row, checked)}
                />
              </TableCell>
            )}
            {columns.map((column) => (
              <DataTableCell key={column.key} className={column.className}>
                {column.render(row)}
              </DataTableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
