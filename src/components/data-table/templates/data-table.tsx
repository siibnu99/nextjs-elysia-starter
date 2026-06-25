"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { DataTableHeader } from "../organisms/data-table-header"
import { DataTableBody } from "../organisms/data-table-body"
import { DataTableFooter } from "../organisms/data-table-footer"
import { DataTableToolbar } from "../organisms/data-table-toolbar"
import { DataTableSkeleton } from "../organisms/data-table-skeleton"
import { DataTableEmpty } from "../organisms/data-table-empty"
import { DataTableError } from "../organisms/data-table-error"

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}

export interface BulkAction<T> {
  label: string
  icon?: ReactNode
  onClick: (rows: T[]) => void
  variant?: "default" | "destructive"
  loading?: boolean
}

export interface DataTableProps<T> {
  // Data
  data: T[]
  columns: Column<T>[]
  totalItems: number

  // Pagination
  page: number
  limit: number
  onPageChange: (page: number) => void

  // Search
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void

  // Sorting
  enableSorting?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (column: string, order: "asc" | "desc") => void

  // Selection
  enableSelection?: boolean
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
  bulkActions?: BulkAction<T>[]

  // Export
  enableExport?: boolean
  onExport?: (format: "csv" | "json") => Promise<void>

  // Density
  density?: "compact" | "normal" | "spacious"
  onDensityChange?: (density: "compact" | "normal" | "spacious") => void

  // Layout
  layout?: "table" | "grid"
  onLayoutChange?: (layout: "table" | "grid") => void
  gridCols?: 1 | 2 | 3 | 4
  renderCard?: (row: T, selectionProps?: {
    selectable: boolean
    selected: boolean
    onSelectionChange: (selected: boolean) => void
  }) => ReactNode

  // State
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void

  // Stats
  responseTime?: number | null
  lastLoadTime?: Date | null

  // Refresh
  onRefresh?: () => void
  isRefreshing?: boolean

  // Customization
  emptyMessage?: string
  emptyIcon?: ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
  }
  getRowId?: (row: T) => string
}

export function DataTable<T>({
  data,
  columns,
  totalItems,
  page,
  limit,
  onPageChange,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  enableSorting,
  sortBy,
  sortOrder,
  onSort,
  enableSelection,
  selectedRows = [],
  onSelectionChange,
  bulkActions,
  enableExport,
  onExport,
  density = "normal",
  onDensityChange,
  layout = "table",
  onLayoutChange,
  gridCols = 2,
  renderCard,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  responseTime,
  lastLoadTime,
  onRefresh,
  isRefreshing,
  emptyMessage,
  emptyIcon,
  emptyAction,
  getRowId,
}: DataTableProps<T>) {
  const [exportLoading, setExportLoading] = useState(false)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [contentRef] = useAutoAnimate()
  const totalPages = Math.ceil(totalItems / limit)

  useEffect(() => {
    if (!isLoading && !isError) {
      setHasLoadedOnce(true)
    }
  }, [isLoading, isError])

  async function handleExport(format: "csv" | "json") {
    if (!onExport) return
    setExportLoading(true)
    try {
      await onExport(format)
    } finally {
      setExportLoading(false)
    }
  }

  function handleSelectAll(checked: boolean) {
    if (!onSelectionChange) return
    if (checked) {
      onSelectionChange(data)
    } else {
      onSelectionChange([])
    }
  }

  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length

  return (
    <div className="space-y-4">
      <DataTableHeader
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        responseTime={responseTime}
        lastLoadTime={lastLoadTime}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        disabled={!!isLoading}
      />

      <DataTableToolbar
        selectedRows={selectedRows}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
        someSelected={someSelected}
        bulkActions={bulkActions}
        enableExport={enableExport}
        onExport={handleExport}
        exportLoading={exportLoading}
        density={density}
        onDensityChange={onDensityChange}
        layout={layout}
        onLayoutChange={onLayoutChange}
        disabled={!!isLoading}
      />

      <div ref={contentRef}>
        {isLoading ? (
          <DataTableSkeleton columns={columns.length + (enableSelection ? 1 : 0)} />
        ) : isError ? (
          <DataTableError message={errorMessage} onRetry={onRetry} />
        ) : data.length === 0 ? (
          <DataTableEmpty message={emptyMessage} icon={emptyIcon} action={emptyAction} />
        ) : layout === "grid" && renderCard ? (
          <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-${gridCols}`}>
            {data.map((row, i) => {
              const rowId = getRowId?.(row) ?? String(i)
              const isSelected = enableSelection
                ? selectedRows.some((r) => getRowId ? getRowId(r) === rowId : r === row)
                : false

              return (
                <div key={rowId}>
                  {renderCard(row, enableSelection ? {
                    selectable: true,
                    selected: isSelected,
                    onSelectionChange: (selected) => {
                      if (!onSelectionChange) return
                      if (selected) {
                        onSelectionChange([...selectedRows, row])
                      } else {
                        onSelectionChange(selectedRows.filter((r) =>
                          getRowId ? getRowId(r) !== rowId : r !== row
                        ))
                      }
                    },
                  } : undefined)}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border">
            <DataTableBody
              data={data}
              columns={columns}
              enableSelection={enableSelection}
              selectedRows={selectedRows}
              onSelectionChange={onSelectionChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={enableSorting ? onSort : undefined}
              density={density}
              getRowId={getRowId}
            />
          </div>
        )}
      </div>

      {hasLoadedOnce && (
        <DataTableFooter
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          selectedCount={selectedRows.length}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
