"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { SelectCheckbox } from "@/components/data-table/atoms/select-checkbox"
import type { Column } from "@/components/data-table"

interface AutoCardProps<T> {
  row: T
  columns: Column<T>[]
  onEdit?: () => void
  onDelete?: () => void
  selectable?: boolean
  selected?: boolean
  onSelectionChange?: (selected: boolean) => void
}

export function AutoCard<T>({
  row,
  columns,
  onEdit,
  onDelete,
  selectable,
  selected,
  onSelectionChange,
}: AutoCardProps<T>) {
  const dataColumns = columns.filter((col) => col.key !== "actions")
  const actionColumn = columns.find((col) => col.key === "actions")

  return (
    <div
      className={`rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      {selectable && onSelectionChange && (
        <div className="flex justify-start mb-3">
          <SelectCheckbox
            checked={selected ?? false}
            onChange={onSelectionChange}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {dataColumns.map((col) => (
          <div key={col.key}>
            <label className="text-xs text-muted-foreground">{col.header}</label>
            <div className="font-medium">{col.render(row)}</div>
          </div>
        ))}
      </div>

      {(actionColumn || onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-3 mt-3 border-t">
          {actionColumn ? (
            actionColumn.render(row)
          ) : (
            <>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
