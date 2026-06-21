import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { LayoutGridIcon } from "lucide-react"

interface DensitySelectorProps {
  density: "compact" | "normal" | "spacious"
  onDensityChange: (density: "compact" | "normal" | "spacious") => void
  disabled?: boolean
}

export function DensitySelector({ density, onDensityChange, disabled }: DensitySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <LayoutGridIcon className="mr-2 h-4 w-4" />
          Density
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onDensityChange("compact")}>
          Compact
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDensityChange("normal")}>
          Normal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDensityChange("spacious")}>
          Spacious
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
