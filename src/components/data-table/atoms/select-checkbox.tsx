import { Checkbox } from "@/components/ui/checkbox"

interface SelectCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  indeterminate?: boolean
}

export function SelectCheckbox({ checked, onChange, indeterminate }: SelectCheckboxProps) {
  return (
    <Checkbox
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={onChange}
      aria-label="Select row"
    />
  )
}
