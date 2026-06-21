"use client"

import { useFormatTime } from "@/hooks/use-format-time"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"

interface TableStatsProps {
  responseTime?: number | null
  lastLoadTime?: Date | null
  onRefresh?: () => void
  isRefreshing?: boolean
  disabled?: boolean
}

export function TableStats({ responseTime, lastLoadTime, onRefresh, isRefreshing, disabled }: TableStatsProps) {
  const { formattedResponseTime, formattedRelativeTime } = useFormatTime({
    responseTime,
    lastLoadTime,
    autoUpdate: true,
    interval: 1000,
  })

  if (!formattedResponseTime && !formattedRelativeTime && !onRefresh) return null

  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      {formattedResponseTime && (
        <span>Response: {formattedResponseTime}</span>
      )}
      {formattedRelativeTime && (
        <span>Last load: {formattedRelativeTime}</span>
      )}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing || disabled}
          className="h-8 px-2"
        >
          <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      )}
    </div>
  )
}
