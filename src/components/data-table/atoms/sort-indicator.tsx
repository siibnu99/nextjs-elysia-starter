import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react"

interface SortIndicatorProps {
  direction?: "asc" | "desc" | null
}

export function SortIndicator({ direction }: SortIndicatorProps) {
  if (!direction) {
    return <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground" />
  }

  if (direction === "asc") {
    return <ArrowUpIcon className="h-4 w-4" />
  }

  return <ArrowDownIcon className="h-4 w-4" />
}
