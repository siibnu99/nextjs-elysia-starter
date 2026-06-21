"use client"

import { type ReactNode } from "react"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DatabaseIcon,
  AlertCircleIcon,
  ListIcon,
  GridIcon,
  LayoutGridIcon,
} from "lucide-react"
import { TablePagination } from "@/components/data-table/molecules/table-pagination"

type Layout = "list" | "grid"
type Density = "compact" | "normal" | "spacious"

interface CardListProps<T> {
  data: T[]
  isLoading?: boolean
  isError?: boolean
  error?: Error
  renderItem: (item: T, index: number) => ReactNode
  emptyMessage?: string
  emptyIcon?: ReactNode
  emptyAction?: {
    label: string
    onClick: () => void
  }
  loadingMessage?: string
  layout?: Layout
  gridCols?: 1 | 2 | 3 | 4
  density?: Density
  enableLayoutToggle?: boolean
  enableDensity?: boolean
  onLayoutChange?: (layout: Layout) => void
  onDensityChange?: (density: Density) => void
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  getRowId?: (item: T) => string
}

const densityPaddingClasses: Record<Density, string> = {
  compact: "p-2",
  normal: "p-4",
  spacious: "p-6",
}

const densityGapClasses: Record<Density, string> = {
  compact: "gap-2",
  normal: "gap-4",
  spacious: "gap-6",
}

const densitySpaceClasses: Record<Density, string> = {
  compact: "space-y-2",
  normal: "space-y-3",
  spacious: "space-y-4",
}

function CardListToolbar({
  layout,
  density,
  enableLayoutToggle,
  enableDensity,
  onLayoutChange,
  onDensityChange,
}: {
  layout: Layout
  density: Density
  enableLayoutToggle?: boolean
  enableDensity?: boolean
  onLayoutChange?: (layout: Layout) => void
  onDensityChange?: (density: Density) => void
}) {
  if (!enableLayoutToggle && !enableDensity) return null

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg border bg-background/80 p-2 backdrop-blur-md">
      {enableLayoutToggle && onLayoutChange && (
        <div className="flex items-center rounded-md border">
          <Button
            variant={layout === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => onLayoutChange("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => onLayoutChange("grid")}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      {enableDensity && onDensityChange && (
        <DensitySelector density={density} onDensityChange={onDensityChange} />
      )}
    </div>
  )
}

function DensitySelector({
  density,
  onDensityChange,
}: {
  density: Density
  onDensityChange: (density: Density) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutGridIcon className="mr-2 h-4 w-4" />
          Density
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onDensityChange("compact")}
          className={density === "compact" ? "bg-primary/10" : ""}
        >
          Compact
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange("normal")}
          className={density === "normal" ? "bg-primary/10" : ""}
        >
          Normal
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange("spacious")}
          className={density === "spacious" ? "bg-primary/10" : ""}
        >
          Spacious
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CardListSkeleton({
  layout,
  gridCols,
  density,
}: {
  layout: Layout
  gridCols: number
  density: Density
}) {
  const items = Array.from({ length: 3 })

  if (layout === "grid") {
    return (
      <div
        className={`grid ${densityGapClasses[density]} grid-cols-1 sm:grid-cols-2 md:grid-cols-${gridCols}`}
      >
        {items.map((_, i) => (
          <div key={i} className={`rounded-lg border ${densityPaddingClasses[density]}`}>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className={densitySpaceClasses[density]}>
      {items.map((_, i) => (
        <li key={i} className={`rounded-lg border ${densityPaddingClasses[density]}`}>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full" />
        </li>
      ))}
    </ul>
  )
}

function CardListError({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
      <p className="text-destructive">{message ?? "Failed to load data"}</p>
    </div>
  )
}

function CardListEmpty({
  message,
  icon,
  action,
}: {
  message?: string
  icon?: ReactNode
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon ?? <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />}
      <p className="text-muted-foreground">{message ?? "No data found"}</p>
      {action && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export function CardList<T>({
  data,
  isLoading,
  isError,
  error,
  renderItem,
  emptyMessage,
  emptyIcon,
  emptyAction,
  layout = "list",
  gridCols = 1,
  density = "normal",
  enableLayoutToggle,
  enableDensity,
  onLayoutChange,
  onDensityChange,
  page,
  totalPages,
  onPageChange,
  getRowId,
}: CardListProps<T>) {
  const [listRef] = useAutoAnimate()

  if (isLoading)
    return (
      <CardListSkeleton layout={layout} gridCols={gridCols} density={density} />
    )
  if (isError) return <CardListError message={error?.message} />
  if (data.length === 0)
    return (
      <CardListEmpty
        message={emptyMessage}
        icon={emptyIcon}
        action={emptyAction}
      />
    )

  return (
    <div className="space-y-4">
      <CardListToolbar
        layout={layout}
        density={density}
        enableLayoutToggle={enableLayoutToggle}
        enableDensity={enableDensity}
        onLayoutChange={onLayoutChange}
        onDensityChange={onDensityChange}
      />

      {layout === "grid" ? (
        <div
          ref={listRef}
          className={`grid ${densityGapClasses[density]} grid-cols-1 sm:grid-cols-2 md:grid-cols-${gridCols}`}
        >
          {data.map((item, i) => (
            <div
              key={getRowId?.(item) ?? i}
              className={`flex flex-col ${densityPaddingClasses[density]}`}
            >
              <div className="flex-1">{renderItem(item, i)}</div>
            </div>
          ))}
        </div>
      ) : (
        <ul ref={listRef} className={densitySpaceClasses[density]}>
          {data.map((item, i) => (
            <li
              key={getRowId?.(item) ?? i}
              className={densityPaddingClasses[density]}
            >
              {renderItem(item, i)}
            </li>
          ))}
        </ul>
      )}

      {page && totalPages && totalPages > 1 && onPageChange && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
