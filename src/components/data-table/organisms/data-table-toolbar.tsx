import { Button } from "@/components/ui/button"
import { ListIcon, GridIcon } from "lucide-react"
import { BulkActions } from "../molecules/bulk-actions"
import { ExportButtons } from "../molecules/export-buttons"
import { DensitySelector } from "../molecules/density-selector"

interface BulkAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (rows: T[]) => void
  variant?: "default" | "destructive"
  loading?: boolean
}

interface DataTableToolbarProps<T> {
  selectedRows: T[]
  onSelectAll: (checked: boolean) => void
  allSelected: boolean
  someSelected: boolean
  bulkActions?: BulkAction<T>[]
  enableExport?: boolean
  onExport?: (format: "csv" | "json") => Promise<void>
  exportLoading?: boolean
  density?: "compact" | "normal" | "spacious"
  onDensityChange?: (density: "compact" | "normal" | "spacious") => void
  layout?: "table" | "grid"
  onLayoutChange?: (layout: "table" | "grid") => void
  disabled?: boolean
}

function LayoutToggle({
  layout,
  onLayoutChange,
  disabled,
}: {
  layout: "table" | "grid"
  onLayoutChange?: (layout: "table" | "grid") => void
  disabled?: boolean
}) {
  if (!onLayoutChange) return null

  return (
    <div className={`flex items-center rounded-md border ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <Button
        variant={layout === "table" ? "default" : "ghost"}
        size="sm"
        className="rounded-r-none"
        onClick={() => onLayoutChange("table")}
        disabled={disabled}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={layout === "grid" ? "default" : "ghost"}
        size="sm"
        className="rounded-l-none"
        onClick={() => onLayoutChange("grid")}
        disabled={disabled}
      >
        <GridIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function DataTableToolbar<T>({
  selectedRows,
  onSelectAll,
  allSelected,
  someSelected,
  bulkActions,
  enableExport,
  onExport,
  exportLoading,
  density,
  onDensityChange,
  layout,
  onLayoutChange,
  disabled,
}: DataTableToolbarProps<T>) {
  return (
    <div className={`flex items-center justify-between ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-2">
        {bulkActions && bulkActions.length > 0 && (
          <BulkActions
            selectedRows={selectedRows}
            onSelectAll={onSelectAll}
            allSelected={allSelected}
            someSelected={someSelected}
            actions={bulkActions}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        {layout && onLayoutChange && (
          <LayoutToggle layout={layout} onLayoutChange={onLayoutChange} disabled={disabled} />
        )}
        {enableExport && onExport && (
          <ExportButtons onExport={onExport} loading={exportLoading} disabled={disabled} />
        )}
        {density && onDensityChange && (
          <DensitySelector density={density} onDensityChange={onDensityChange} disabled={disabled} />
        )}
      </div>
    </div>
  )
}
