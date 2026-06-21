import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SortIndicator } from "./sort-indicator"

interface TableHeaderCellProps {
  children: React.ReactNode
  className?: string
  sortable?: boolean
  sortDirection?: "asc" | "desc" | null
  onSort?: () => void
}

export function TableHeaderCell({
  children,
  className,
  sortable,
  sortDirection,
  onSort,
}: TableHeaderCellProps) {
  if (!sortable) {
    return (
      <th className={cn("px-4 py-3 text-left font-medium", className)}>
        {children}
      </th>
    )
  }

  return (
    <th className={cn("px-4 py-3 text-left font-medium", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={onSort}
      >
        {children}
        <SortIndicator direction={sortDirection} />
      </Button>
    </th>
  )
}
