import { TableHeaderCell } from "../atoms/table-header-cell"

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface ColumnHeaderProps<T> {
  column: Column<T>
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (column: string, order: "asc" | "desc") => void
}

export function ColumnHeader<T>({ column, sortBy, sortOrder, onSort }: ColumnHeaderProps<T>) {
  const isActive = sortBy === column.key
  const currentDirection = isActive ? sortOrder : null

  function handleSort() {
    if (!onSort) return
    const newOrder = isActive && sortOrder === "asc" ? "desc" : "asc"
    onSort(column.key, newOrder)
  }

  return (
    <TableHeaderCell
      className={column.className}
      sortable={column.sortable}
      sortDirection={currentDirection}
      onSort={handleSort}
    >
      {column.header}
    </TableHeaderCell>
  )
}
