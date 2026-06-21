"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateAssignment } from "../_server"
import {
  assignmentsQueryKey,
  type Assignment,
  type AssignmentBodyInput,
} from "../_server/type"
import { AssignmentsForm } from "./assignments-form"

interface EditAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
}

export function EditAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: EditAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: AssignmentBodyInput & { scopeItemIds: string[] }) =>
      updateAssignment(assignment.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey })
      onOpenChange(false)
      toast.success("Assignment updated.")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleSubmit(values: AssignmentBodyInput & { scopeItemIds: string[] }) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
        </DialogHeader>
        <AssignmentsForm
          mode="edit"
          initialValues={{
            name: assignment.name,
            roleId: assignment.roleId,
            scopeId: assignment.scopeId,
            scopeMode: assignment.scopeMode as "global" | "single" | "multiple",
            scopeItemIds: [],
          }}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
