"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { useDebounce } from "./use-debounce"
import { useTableDensity } from "./use-table-density"
import { exportData } from "@/lib/utils/export"

interface ExportColumn {
  key: string
  header: string
}

interface PaginationInput {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseDataTableOptions<T> {
  queryKey: readonly unknown[]
  fetchFn: (params: PaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" }) => Promise<PaginatedResponse<T> | T[]>
  exportFilename: string
  exportColumns: ExportColumn[]
  limit?: number
  paginated?: boolean
}

export function useDataTable<T>({
  queryKey,
  fetchFn,
  exportFilename,
  exportColumns,
  limit = 10,
  paginated = true,
}: UseDataTableOptions<T>) {
  const [isClient, setIsClient] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<string | undefined>()
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>()
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [lastLoadTime, setLastLoadTime] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const debouncedSearch = useDebounce(search, 300)
  const { density, handleDensityChange } = useTableDensity()

  const { data, isError, error, refetch, isPending } = useQuery({
    queryKey: [...queryKey, page, debouncedSearch, sortBy, sortOrder],
    queryFn: async () => {
      startTimeRef.current = performance.now()
      const result = await fetchFn({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder,
      })
      setResponseTime(Math.round(performance.now() - startTimeRef.current))
      setLastLoadTime(new Date())
      setHasFetched(true)
      return result
    },
    enabled: isClient,
  })

  // Loading is true until client-side and first fetch completes
  // This ensures consistent state between server and client
  const isLoading = !isClient || (isClient && !hasFetched && isPending)

  const normalizedData = paginated
    ? (data as PaginatedResponse<T>)?.data ?? []
    : (data as T[]) ?? []
  const pagination = paginated
    ? (data as PaginatedResponse<T>)?.pagination
    : null

  async function handleRefresh() {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleSort(column: string, order: "asc" | "desc") {
    setSortBy(column)
    setSortOrder(order)
    setPage(1)
  }

  async function handleExport(format: "csv" | "json") {
    await exportData({
      data: normalizedData,
      columns: exportColumns,
      filename: exportFilename,
      format,
    })
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  return {
    page,
    setPage,
    search,
    setSearch,
    sortBy,
    sortOrder,
    selectedRows,
    setSelectedRows,
    density,
    handleDensityChange,
    responseTime,
    lastLoadTime,
    isRefreshing,
    data: normalizedData,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  }
}
