import { TableSearch } from "../molecules/table-search"
import { TableStats } from "../molecules/table-stats"

interface DataTableHeaderProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  responseTime?: number | null
  lastLoadTime?: Date | null
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function DataTableHeader({
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  responseTime,
  lastLoadTime,
  onRefresh,
  isRefreshing,
}: DataTableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {onSearchChange && (
        <TableSearch
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={onSearchChange}
          onClear={() => onSearchChange("")}
        />
      )}
      <TableStats
        responseTime={responseTime}
        lastLoadTime={lastLoadTime}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}
