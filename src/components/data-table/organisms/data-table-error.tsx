import { AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DataTableErrorProps {
  message?: string
  onRetry?: () => void
}

export function DataTableError({
  message = "Failed to load data",
  onRetry,
}: DataTableErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircleIcon className="h-12 w-12 text-destructive mb-4" />
      <p className="text-destructive">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  )
}
