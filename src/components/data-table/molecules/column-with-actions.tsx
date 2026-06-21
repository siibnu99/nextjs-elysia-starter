import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { Column } from "@/components/data-table"

interface ActionConfig<T> {
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  variant?: "default" | "outline" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

interface ColumnWithActionsProps<T> {
  columns: Column<T>[]
  actions: ActionConfig<T>[]
}

export function ColumnWithActions<T>({ columns, actions }: ColumnWithActionsProps<T>): Column<T>[] {
  return columns.map((col) => {
    if (col.key === "actions") {
      return {
        ...col,
        render: (row: T) => (
          <div className="flex items-center gap-2">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant ?? "outline"}
                size={action.size ?? "sm"}
                onClick={() => action.onClick(row)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        ),
      }
    }
    return col
  })
}
