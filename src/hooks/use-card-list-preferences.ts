"use client"

import { useState, useEffect } from "react"

type Layout = "list" | "grid"
type Density = "compact" | "normal" | "spacious"

interface CardListPreferences {
  layout: Layout
  density: Density
  setLayout: (layout: Layout) => void
  setDensity: (density: Density) => void
}

export function useCardListPreferences(
  defaultLayout: Layout = "list",
  defaultDensity: Density = "normal"
): CardListPreferences {
  const [layout, setLayoutState] = useState<Layout>(defaultLayout)
  const [density, setDensityState] = useState<Density>(defaultDensity)

  useEffect(() => {
    if (typeof document === "undefined") return

    const layoutMatch = document.cookie.match(/card_list_layout=([^;]+)/)
    if (layoutMatch && ["list", "grid"].includes(layoutMatch[1])) {
      setLayoutState(layoutMatch[1] as Layout)
    }

    const densityMatch = document.cookie.match(/card_list_density=([^;]+)/)
    if (densityMatch && ["compact", "normal", "spacious"].includes(densityMatch[1])) {
      setDensityState(densityMatch[1] as Density)
    }
  }, [])

  function setLayout(newLayout: Layout) {
    setLayoutState(newLayout)
    document.cookie = `card_list_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  function setDensity(newDensity: Density) {
    setDensityState(newDensity)
    document.cookie = `card_list_density=${newDensity}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  return { layout, density, setLayout, setDensity }
}
