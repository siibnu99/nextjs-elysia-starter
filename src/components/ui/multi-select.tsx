"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  values: string[]
  onValuesChange: (values: string[]) => void
  children: React.ReactNode
}

interface MultiSelectTriggerProps {
  children: React.ReactNode
  className?: string
  id?: string
  "aria-invalid"?: boolean
}

interface MultiSelectContentProps {
  children: React.ReactNode
}

interface MultiSelectItemProps {
  value: string
  children: React.ReactNode
}

const MultiSelectContext = React.createContext<{
  values: string[]
  onValuesChange: (values: string[]) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
  values: [],
  onValuesChange: () => {},
  open: false,
  setOpen: () => {},
})

export function MultiSelect({ values, onValuesChange, children }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <MultiSelectContext.Provider value={{ values, onValuesChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </MultiSelectContext.Provider>
  )
}

export function MultiSelectTrigger({ children, className, id, ...props }: MultiSelectTriggerProps) {
  const { open, setOpen } = React.useContext(MultiSelectContext)

  return (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className={cn("w-full justify-between", className)}
      onClick={() => setOpen(!open)}
      id={id}
      {...props}
    >
      {children}
      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  )
}

export function MultiSelectValue({ placeholder }: { placeholder?: string }) {
  const { values } = React.useContext(MultiSelectContext)

  if (values.length === 0) {
    return <span className="text-muted-foreground">{placeholder}</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {values.length <= 2 ? (
        values.map((value) => (
          <Badge key={value} variant="secondary" className="text-xs">
            {value}
          </Badge>
        ))
      ) : (
        <>
          <Badge variant="secondary" className="text-xs">
            {values[0]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            +{values.length - 1} more
          </Badge>
        </>
      )}
    </div>
  )
}

export function MultiSelectContent({ children }: MultiSelectContentProps) {
  const { open } = React.useContext(MultiSelectContext)

  if (!open) return null

  return (
    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
      {children}
    </div>
  )
}

export function MultiSelectItem({ value, children }: MultiSelectItemProps) {
  const { values, onValuesChange, setOpen } = React.useContext(MultiSelectContext)
  const isSelected = values.includes(value)

  function handleSelect() {
    if (isSelected) {
      onValuesChange(values.filter((v) => v !== value))
    } else {
      onValuesChange([...values, value])
    }
  }

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground"
      )}
      onClick={handleSelect}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}
