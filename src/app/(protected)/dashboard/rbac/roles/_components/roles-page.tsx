"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { RolesDataTable } from "./roles-data-table"
import { type Role } from "../_server/type"
import { CreateRoleDialog } from "./create-dialog"
import { EditRoleDialog } from "./edit-dialog"
import { DeleteRoleDialog } from "./delete-dialog"
import { BulkDeleteDialog } from "./bulk-delete-dialog"

export function RolesPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and their permissions"
        action={{ label: "+ Add Role", onClick: () => setIsCreateOpen(true) }}
      />

      <RolesDataTable
        onEdit={(role) => {
          setEditingRole(role)
          setIsEditOpen(true)
        }}
        onDelete={(role) => {
          setDeletingRole(role)
          setIsDeleteOpen(true)
        }}
        onBulkDelete={(roles) => {
          setSelectedRoles(roles)
          setIsBulkDeleteOpen(true)
        }}
        onCreate={() => setIsCreateOpen(true)}
        onSelectionChange={setSelectedRoles}
      />

      <CreateRoleDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingRole && (
        <EditRoleDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingRole(null)
          }}
          role={editingRole}
        />
      )}

      {deletingRole && (
        <DeleteRoleDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open)
            if (!open) setDeletingRole(null)
          }}
          role={deletingRole}
        />
      )}

      {selectedRoles.length > 0 && (
        <BulkDeleteDialog
          open={isBulkDeleteOpen}
          onOpenChange={(open) => {
            setIsBulkDeleteOpen(open)
            if (!open) setSelectedRoles([])
          }}
          roles={selectedRoles}
        />
      )}
    </div>
  )
}
