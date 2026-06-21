import { DatabaseIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableEmptyProps {
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function DataTableEmpty({
  message = "No data found",
  icon,
  action,
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon ?? <DatabaseIcon className="h-12 w-12 text-muted-foreground mb-4" />}
      <p className="text-muted-foreground">{message}</p>
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
