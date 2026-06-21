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
import { deleteAssignments } from "../_server"
import { assignmentsQueryKey, type Assignment } from "../_server/type"

interface BulkDeleteAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignments: Assignment[]
}

export function BulkDeleteAssignmentDialog({
  open,
  onOpenChange,
  assignments,
}: BulkDeleteAssignmentDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteAssignments(assignments.map((a) => a.id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentsQueryKey })
      onOpenChange(false)
      toast.success(`${assignments.length} assignments deleted.`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Assignments</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following {assignments.length}{" "}
            assignments? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto rounded-md border p-2">
          <ul className="space-y-1 text-sm">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="rounded px-2 py-1 hover:bg-muted"
              >
                {assignment.name}
              </li>
            ))}
          </ul>
        </div>
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
            {mutation.isPending
              ? "Deleting..."
              : `Delete ${assignments.length} Assignments`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
