"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { ColumnWithActions } from "@/components/data-table/molecules/column-with-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { AutoCard } from "@/components/auto-card"
import { fetchPermissions } from "../_server"
import { permissionsQueryKey, type Permission } from "../_server/type"

const columns: Column<Permission>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (permission) => <span className="font-medium">{permission.name}</span>,
  },
  {
    key: "description",
    header: "Description",
    render: (permission) => (
      <span className="text-muted-foreground">
        {permission.description ?? "-"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    className: "w-[100px]",
    render: () => null,
  },
]

interface PermissionsDataTableProps {
  onEdit: (permission: Permission) => void
  onDelete: (permission: Permission) => void
  onBulkDelete: (permissions: Permission[]) => void
  onCreate: () => void
  onSelectionChange?: (permissions: Permission[]) => void
}

export function PermissionsDataTable({
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onSelectionChange,
}: PermissionsDataTableProps) {
  const [layout, setLayout] = useState<"table" | "grid">("table")

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/permissions_layout=([^;]+)/)
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid")
    }
  }, [])

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout)
    document.cookie = `permissions_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
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
    data: permissions,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: permissionsQueryKey,
    fetchFn: fetchPermissions,
    exportFilename: "permissions",
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
      data={permissions}
      columns={columnsWithActions}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search permissions..."
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
      renderCard={(row, selectionProps) => (
        <AutoCard
          row={row}
          columns={columnsWithActions}
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
          selectable={selectionProps?.selectable}
          selected={selectionProps?.selected}
          onSelectionChange={selectionProps?.onSelectionChange}
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
      emptyMessage="No permissions found. Create your first permission."
      emptyAction={{ label: "+ Add Permission", onClick: onCreate }}
      getRowId={(permission) => permission.id}
    />
  )
}
