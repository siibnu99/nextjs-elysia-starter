import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  disabled?: boolean
}

export function SearchInput({ placeholder = "Search...", value, onChange, onClear, disabled }: SearchInputProps) {
  return (
    <div className="relative max-w-sm">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-8"
        disabled={disabled}
      />
      {value && onClear && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-2"
          onClick={onClear}
          disabled={disabled}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
