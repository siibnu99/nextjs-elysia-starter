"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { deleteAssignment } from "../_server"
import { assignmentsQueryKey, type Assignment } from "../_server/type"

interface DeleteAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: Assignment
}

export function DeleteAssignmentDialog({
  open,
  onOpenChange,
  assignment,
}: DeleteAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteAssignment(assignment.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey })
      onOpenChange(false)
      toast.success("Assignment deleted.")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Assignment</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the assignment{" "}
            <span className="font-semibold">{assignment.name}</span>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
