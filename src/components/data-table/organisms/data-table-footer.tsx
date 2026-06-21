import { TablePagination } from "../molecules/table-pagination"

interface DataTableFooterProps {
  page: number
  totalPages: number
  totalItems: number
  selectedCount: number
  onPageChange: (page: number) => void
}

export function DataTableFooter({
  page,
  totalPages,
  totalItems,
  selectedCount,
  onPageChange,
}: DataTableFooterProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">
        {selectedCount > 0
          ? `${selectedCount} selected`
          : `${totalItems} total`}
      </span>
      {totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
