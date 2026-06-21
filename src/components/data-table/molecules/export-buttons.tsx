"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DownloadIcon, FileJsonIcon, FileSpreadsheetIcon } from "lucide-react"

interface ExportButtonsProps {
  onExport: (format: "csv" | "json") => Promise<void>
  loading?: boolean
}

export function ExportButtons({ onExport, loading }: ExportButtonsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          {loading ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onExport("csv")}>
          <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("json")}>
          <FileJsonIcon className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
