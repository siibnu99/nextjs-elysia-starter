"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { ColumnWithActions } from "@/components/data-table/molecules/column-with-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { AutoCard } from "@/components/auto-card"
import { fetchRoles } from "../_server"
import { rolesQueryKey, type Role } from "../_server/type"

const columns: Column<Role>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (role) => <span className="font-medium">{role.name}</span>,
  },
  {
    key: "description",
    header: "Description",
    render: (role) => (
      <span className="text-muted-foreground">{role.description ?? "-"}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    className: "w-[100px]",
    render: () => null,
  },
]

interface RolesDataTableProps {
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onBulkDelete: (roles: Role[]) => void
  onCreate: () => void
  onSelectionChange?: (roles: Role[]) => void
}

export function RolesDataTable({
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onSelectionChange,
}: RolesDataTableProps) {
  const [layout, setLayout] = useState<"table" | "grid">("table")

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/roles_layout=([^;]+)/)
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid")
    }
  }, [])

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout)
    document.cookie = `roles_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  const {
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
    data: roles,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: rolesQueryKey,
    fetchFn: fetchRoles,
    exportFilename: "roles",
    exportColumns: [
      { key: "name", header: "Name" },
      { key: "description", header: "Description" },
    ],
  })

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows, onSelectionChange])

  const columnsWithActions = ColumnWithActions({
    columns,
    actions: [
      { label: "Edit", onClick: onEdit },
      { label: "Delete", variant: "destructive", onClick: onDelete },
    ],
  })

  return (
    <DataTable
      data={roles}
      columns={columnsWithActions}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search roles..."
      searchValue={search}
      onSearchChange={setSearch}
      enableSorting
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      enableSelection
      selectedRows={selectedRows}
      onSelectionChange={setSelectedRows}
      bulkActions={[
        {
          label: "Bulk Delete",
          onClick: () => onBulkDelete(selectedRows),
          variant: "destructive",
        },
      ]}
      enableExport
      onExport={handleExport}
      density={density}
      onDensityChange={handleDensityChange}
      layout={layout}
      onLayoutChange={handleLayoutChange}
      gridCols={3}
      renderCard={(row) => (
        <AutoCard
          row={row}
          columns={columnsWithActions}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      )}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => refetch()}
      responseTime={responseTime}
      lastLoadTime={lastLoadTime}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      emptyMessage="No roles found. Create your first role."
      emptyAction={{ label: "+ Add Role", onClick: onCreate }}
      getRowId={(role) => role.id}
    />
  )
}
