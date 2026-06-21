"use client"

import { useState, useEffect, useCallback } from "react"

export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

interface UseFormatTimeOptions {
  responseTime?: number | null
  lastLoadTime?: Date | null
  autoUpdate?: boolean
  interval?: number
}

interface UseFormatTimeReturn {
  formattedResponseTime: string | null
  formattedRelativeTime: string | null
  tick: number
}

export function useFormatTime({
  responseTime,
  lastLoadTime,
  autoUpdate = true,
  interval = 1000,
}: UseFormatTimeOptions): UseFormatTimeReturn {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!autoUpdate || !lastLoadTime) return

    const timer = setInterval(() => {
      setTick((prev) => prev + 1)
    }, interval)

    return () => clearInterval(timer)
  }, [autoUpdate, lastLoadTime, interval])

  const formattedResponseTime = responseTime != null ? formatResponseTime(responseTime) : null
  const formattedRelativeTime = lastLoadTime ? formatRelativeTime(lastLoadTime) : null

  return {
    formattedResponseTime,
    formattedRelativeTime,
    tick,
  }
}
