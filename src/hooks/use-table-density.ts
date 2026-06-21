"use client"

import { useState, useEffect } from "react"

type Density = "compact" | "normal" | "spacious"

export function useTableDensity(defaultDensity: Density = "normal") {
  const [density, setDensity] = useState<Density>(defaultDensity)

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/table_density=([^;]+)/)
    if (match && ["compact", "normal", "spacious"].includes(match[1])) {
      setDensity(match[1] as Density)
    }
  }, [])

  function handleDensityChange(newDensity: Density) {
    setDensity(newDensity)
    document.cookie = `table_density=${newDensity}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  return { density, handleDensityChange }
}
