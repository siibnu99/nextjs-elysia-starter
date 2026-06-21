"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { AssignmentsDataTable } from "./assignments-data-table"
import { type Assignment } from "../_server/type"
import { CreateAssignmentDialog } from "./create-dialog"
import { EditAssignmentDialog } from "./edit-dialog"
import { DeleteAssignmentDialog } from "./delete-dialog"
import { BulkDeleteAssignmentDialog } from "./bulk-delete-dialog"

export function AssignmentsPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Manage role assignments with scope"
        action={{
          label: "+ Add Assignment",
          onClick: () => setIsCreateOpen(true),
        }}
      />

      <AssignmentsDataTable
        onEdit={(assignment) => {
          setEditingAssignment(assignment)
          setIsEditOpen(true)
        }}
        onDelete={(assignment) => {
          setDeletingAssignment(assignment)
          setIsDeleteOpen(true)
        }}
        onBulkDelete={(assignments) => {
          setSelectedAssignments(assignments)
          setIsBulkDeleteOpen(true)
        }}
        onCreate={() => setIsCreateOpen(true)}
        onSelectionChange={setSelectedAssignments}
      />

      <CreateAssignmentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingAssignment && (
        <EditAssignmentDialog
          open={isEditOpen}
          onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingAssignment(null)
          }}
          assignment={editingAssignment}
        />
      )}

      {deletingAssignment && (
        <DeleteAssignmentDialog
          open={isDeleteOpen}
          onOpenChange={(open) => {
            setIsDeleteOpen(open)
            if (!open) setDeletingAssignment(null)
          }}
          assignment={deletingAssignment}
        />
      )}

      {selectedAssignments.length > 0 && (
        <BulkDeleteAssignmentDialog
          open={isBulkDeleteOpen}
          onOpenChange={(open) => {
            setIsBulkDeleteOpen(open)
            if (!open) setSelectedAssignments([])
          }}
          assignments={selectedAssignments}
        />
      )}
    </div>
  )
}
