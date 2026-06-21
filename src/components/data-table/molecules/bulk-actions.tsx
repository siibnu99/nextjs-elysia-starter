import { Button } from "@/components/ui/button"
import { SelectCheckbox } from "../atoms/select-checkbox"
import { TrashIcon } from "lucide-react"

interface BulkAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (rows: T[]) => void
  variant?: "default" | "destructive"
  loading?: boolean
}

interface BulkActionsProps<T> {
  selectedRows: T[]
  onSelectAll: (checked: boolean) => void
  allSelected: boolean
  someSelected: boolean
  actions: BulkAction<T>[]
}

export function BulkActions<T>({
  selectedRows,
  onSelectAll,
  allSelected,
  someSelected,
  actions,
}: BulkActionsProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <SelectCheckbox
        checked={allSelected}
        onChange={onSelectAll}
        indeterminate={someSelected}
      />
      {selectedRows.length > 0 && (
        <>
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          {actions.map((action, i) => (
            <Button
              key={i}
              variant={action.variant ?? "outline"}
              size="sm"
              onClick={() => action.onClick(selectedRows)}
              disabled={action.loading}
            >
              {action.icon ?? <TrashIcon className="mr-2 h-4 w-4" />}
              {action.loading ? "Processing..." : action.label}
            </Button>
          ))}
        </>
      )}
    </div>
  )
}
