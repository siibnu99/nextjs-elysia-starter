import { SearchInput } from "../atoms/search-input"

interface TableSearchProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onClear?: () => void
}

export function TableSearch({ placeholder, value, onChange, onClear }: TableSearchProps) {
  return (
    <SearchInput
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onClear={onClear}
    />
  )
}
