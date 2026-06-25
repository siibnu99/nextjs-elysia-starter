"use client"

import { useState, useEffect } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { ColumnWithActions } from "@/components/data-table/molecules/column-with-actions"
import { useDataTable } from "@/hooks/use-data-table"
import { AutoCard } from "@/components/auto-card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchUsers } from "../_server"
import { usersQueryKey, type UserWithAssignments } from "../_server/type"

const columns: Column<UserWithAssignments>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    render: (user) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-xs">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{user.name}</span>
      </div>
    ),
  },
  {
    key: "email",
    header: "Email",
    sortable: true,
    render: (user) => (
      <span className="text-muted-foreground">{user.email}</span>
    ),
  },
  {
    key: "emailVerified",
    header: "Status",
    render: (user) => (
      <Badge variant={user.emailVerified ? "default" : "outline"}>
        {user.emailVerified ? "Verified" : "Unverified"}
      </Badge>
    ),
  },
  {
    key: "assignmentCount",
    header: "Assignments",
    render: (user) => (
      <span className="text-muted-foreground">{user.assignmentCount}</span>
    ),
  },
  {
    key: "createdAt",
    header: "Created",
    sortable: true,
    render: (user) => (
      <span className="text-muted-foreground text-sm">
        {new Date(user.createdAt).toLocaleDateString()}
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

interface UsersDataTableProps {
  onEdit: (user: UserWithAssignments) => void
  onDelete: (user: UserWithAssignments) => void
  onBulkDelete: (users: UserWithAssignments[]) => void
  onManageAssignments: (user: UserWithAssignments) => void
  onCreate: () => void
  onSelectionChange?: (users: UserWithAssignments[]) => void
}

export function UsersDataTable({
  onEdit,
  onDelete,
  onBulkDelete,
  onManageAssignments,
  onCreate,
  onSelectionChange,
}: UsersDataTableProps) {
  const [layout, setLayout] = useState<"table" | "grid">("table")

  useEffect(() => {
    if (typeof document === "undefined") return
    const match = document.cookie.match(/users_layout=([^;]+)/)
    if (match && ["table", "grid"].includes(match[1])) {
      setLayout(match[1] as "table" | "grid")
    }
  }, [])

  function handleLayoutChange(newLayout: "table" | "grid") {
    setLayout(newLayout)
    document.cookie = `users_layout=${newLayout}; path=/; max-age=${60 * 60 * 24 * 365}`
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
    data: users,
    pagination,
    isLoading,
    isError,
    error,
    handleSort,
    handleExport,
    handleRefresh,
    refetch,
  } = useDataTable({
    queryKey: usersQueryKey,
    fetchFn: fetchUsers,
    exportFilename: "users",
    exportColumns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "emailVerified", header: "Verified" },
      { key: "createdAt", header: "Created At" },
    ],
  })

  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [selectedRows, onSelectionChange])

  const columnsWithActions = ColumnWithActions({
    columns,
    actions: [
      { label: "Edit", onClick: onEdit },
      { label: "Manage Assignments", onClick: onManageAssignments },
      { label: "Delete", variant: "destructive", onClick: onDelete },
    ],
  })

  return (
    <DataTable
      data={users}
      columns={columnsWithActions}
      totalItems={pagination?.total ?? 0}
      page={page}
      limit={10}
      onPageChange={setPage}
      searchPlaceholder="Search users by name or email..."
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
      emptyMessage="No users found."
      emptyAction={{ label: "+ Add User", onClick: onCreate }}
      getRowId={(user) => user.id}
    />
  )
}
