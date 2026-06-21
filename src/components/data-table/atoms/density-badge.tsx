import { Badge } from "@/components/ui/badge"

interface DensityBadgeProps {
  density: "compact" | "normal" | "spacious"
}

const densityLabels = {
  compact: "Compact",
  normal: "Normal",
  spacious: "Spacious",
}

export function DensityBadge({ density }: DensityBadgeProps) {
  return (
    <Badge variant="outline" className="text-xs">
      {densityLabels[density]}
    </Badge>
  )
}
