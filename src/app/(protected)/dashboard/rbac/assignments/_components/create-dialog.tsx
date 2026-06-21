"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createAssignment } from "../_server"
import { assignmentsQueryKey, type AssignmentBodyInput } from "../_server/type"
import { AssignmentsForm } from "./assignments-form"

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAssignmentDialog({
  open,
  onOpenChange,
}: CreateAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: AssignmentBodyInput & { scopeItemIds: string[] }) =>
      createAssignment(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey })
      onOpenChange(false)
      toast.success("Assignment created.")
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
          <DialogTitle>Create Assignment</DialogTitle>
        </DialogHeader>
        <AssignmentsForm
          mode="create"
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
