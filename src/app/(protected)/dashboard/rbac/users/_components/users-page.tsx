"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { UsersDataTable } from "./users-data-table"
import { type UserWithAssignments } from "../_server/type"
import { CreateUserDialog } from "./create-dialog"
import { EditUserDialog } from "./edit-dialog"
import { DeleteUserDialog } from "./delete-dialog"
import { BulkDeleteDialog } from "./bulk-delete-dialog"
import { UserAssignmentsDialog } from "./user-assignments-dialog"

export function UsersPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithAssignments | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserWithAssignments | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<UserWithAssignments[]>([])
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false)
  const [assignmentsUser, setAssignmentsUser] = useState<UserWithAssignments | null>(null)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage users and their role assignments"
        action={{ label: "+ Add User", onClick: () => setIsCreateOpen(true) }}
      />

      <UsersDataTable
        onEdit={(user) => {
          setEditingUser(user)
          setIsEditOpen(true)
        }}
        onDelete={(user) => {
          setDeletingUser(user)
          setIsDeleteOpen(true)
        }}
        onBulkDelete={(users) => {
          setSelectedUsers(users)
          setIsBulkDeleteOpen(true)
        }}
        onManageAssignments={(user) => {
          setAssignmentsUser(user)
          setIsAssignmentsOpen(true)
        }}
        onCreate={() => setIsCreateOpen(true)}
        onSelectionChange={setSelectedUsers}
      />

      <CreateUserDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingUser && (
        <EditUserDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingUser(null)
          }}
          user={editingUser}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open)
            if (!open) setDeletingUser(null)
          }}
          user={deletingUser}
        />
      )}

      {selectedUsers.length > 0 && (
        <BulkDeleteDialog
          open={isBulkDeleteOpen}
          onOpenChange={(open) => {
            setIsBulkDeleteOpen(open)
            if (!open) setSelectedUsers([])
          }}
          users={selectedUsers}
        />
      )}

      {assignmentsUser && (
        <UserAssignmentsDialog
          open={isAssignmentsOpen}
          onOpenChange={(open) => {
            setIsAssignmentsOpen(open)
            if (!open) setAssignmentsUser(null)
          }}
          user={assignmentsUser}
        />
      )}
    </div>
  )
}
