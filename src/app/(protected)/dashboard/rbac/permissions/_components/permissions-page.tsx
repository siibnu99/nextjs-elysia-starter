"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { PermissionsDataTable } from "./permissions-data-table"
import { type Permission } from "../_server/type"
import { CreatePermissionDialog } from "./create-dialog"
import { EditPermissionDialog } from "./edit-dialog"
import { DeletePermissionDialog } from "./delete-dialog"
import { BulkDeletePermissionDialog } from "./bulk-delete-dialog"

export function PermissionsPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permissions"
        description="Manage permissions for roles"
        action={{
          label: "+ Add Permission",
          onClick: () => setIsCreateOpen(true),
        }}
      />

      <PermissionsDataTable
        onEdit={(permission) => {
          setEditingPermission(permission)
          setIsEditOpen(true)
        }}
        onDelete={(permission) => {
          setDeletingPermission(permission)
          setIsDeleteOpen(true)
        }}
        onBulkDelete={(permissions) => {
          setSelectedPermissions(permissions)
          setIsBulkDeleteOpen(true)
        }}
        onCreate={() => setIsCreateOpen(true)}
        onSelectionChange={setSelectedPermissions}
      />

      <CreatePermissionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingPermission && (
        <EditPermissionDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingPermission(null)
          }}
          permission={editingPermission}
        />
      )}

      {deletingPermission && (
        <DeletePermissionDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open)
            if (!open) setDeletingPermission(null)
          }}
          permission={deletingPermission}
        />
      )}

      {selectedPermissions.length > 0 && (
        <BulkDeletePermissionDialog
          open={isBulkDeleteOpen}
          onOpenChange={(open) => {
            setIsBulkDeleteOpen(open)
            if (!open) setSelectedPermissions([])
          }}
          permissions={selectedPermissions}
        />
      )}
    </div>
  )
}
