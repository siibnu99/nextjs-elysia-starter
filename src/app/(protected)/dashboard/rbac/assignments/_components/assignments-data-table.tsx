"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { ColumnWithActions } from "@/components/data-table/molecules/column-with-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { AutoCard } from "@/components/auto-card"
import { Badge } from "@/components/ui/badge"
import { fetchAssignments } from "../_server"
import { assignmentsQueryKey, type Assignment } from "../_server/type"

const columns: Column<Assignment>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (assignment) => <span className="font-medium">{assignment.name}</span>,
  },
  {
    key: "scopeMode",
    header: "Scope Mode",
    render: (assignment) => (
      <Badge variant={assignment.scopeMode === "global" ? "default" : "outline"}>
        {assignment.scopeMode}
      </Badge>
    ),
  },
  {
    key: "roleId",
    header: "Role",
    render: (assignment) => <span className="text-muted-foreground">{assignment.roleId}</span>,
  },
  {
    key: "scopeId",
    header: "Scope",
    render: (assignment) => (
      <span className="text-muted-foreground">{assignment.scopeId ?? "-"}</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    className: "w-[100px]",
    render: () => null,
  },
]

interface AssignmentsDataTableProps {
  onEdit: (assignment: Assignment) => void
  onDelete: (assignment: Assignment) => void
  onBulkDelete: (assignments: Assignment[]) => void
  onCreate: () => void
  onSelectionChange?: (assignments: Assignment[]) => void
}

export function AssignmentsDataTable({
  onEdit,
  onDelete,
  onBulkDelete,
  onCreate,
  onSelectionChange,
}: AssignmentsDataTableProps) {
  const [layout, setLayout] = useState<"table" | "grid">("table")

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/assignments_layout=([^;]+)/)
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid")
    }
  }, [])

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout)
    document.cookie = `assignments_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
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
    data: assignments,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: assignmentsQueryKey,
    fetchFn: fetchAssignments,
    exportFilename: "assignments",
    exportColumns: [
      { key: "name", header: "Name" },
      { key: "scopeMode", header: "Scope Mode" },
      { key: "roleId", header: "Role ID" },
      { key: "scopeId", header: "Scope ID" },
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
      data={assignments}
      columns={columnsWithActions}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search assignments..."
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
      emptyMessage="No assignments found. Create your first assignment."
      emptyAction={{ label: "+ Add Assignment", onClick: onCreate }}
      getRowId={(assignment) => assignment.id}
    />
  )
}
