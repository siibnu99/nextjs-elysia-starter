"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { AutoCard } from "@/components/auto-card"
import { fetchScopes } from "../_server"
import { scopesQueryKey, type Scope } from "../_server/type"

const columns: Column<Scope>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (scope) => <span className="font-medium">{scope.name}</span>,
  },
  {
    key: "description",
    header: "Description",
    render: (scope) => (
      <span className="text-muted-foreground">
        {scope.description ?? "-"}
      </span>
    ),
  },
]

export function ScopesDataTable() {
  const [layout, setLayout] = useState<"table" | "grid">("table")

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/scopes_layout=([^;]+)/)
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid")
    }
  }, [])

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout)
    document.cookie = `scopes_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  const {
    page,
    setPage,
    search,
    setSearch,
    sortBy,
    sortOrder,
    density,
    handleDensityChange,
    responseTime,
    lastLoadTime,
    isRefreshing,
    data: scopes,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: scopesQueryKey,
    fetchFn: fetchScopes,
    exportFilename: "scopes",
    exportColumns: [
      { key: "name", header: "Name" },
      { key: "description", header: "Description" },
    ],
  })

  return (
    <DataTable
      data={scopes}
      columns={columns}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search scopes..."
      searchValue={search}
      onSearchChange={setSearch}
      enableSorting
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      enableExport
      onExport={handleExport}
      density={density}
      onDensityChange={handleDensityChange}
      layout={layout}
      onLayoutChange={handleLayoutChange}
      gridCols={3}
      renderCard={(row) => <AutoCard row={row} columns={columns} />}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => refetch()}
      responseTime={responseTime}
      lastLoadTime={lastLoadTime}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      emptyMessage="No scopes found."
      getRowId={(scope) => scope.id}
    />
  )
}
