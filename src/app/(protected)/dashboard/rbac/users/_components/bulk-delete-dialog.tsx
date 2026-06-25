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
import { deleteUsers } from "../_server"
import { usersQueryKey, type UserWithAssignments } from "../_server/type"

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: UserWithAssignments[]
}

export function BulkDeleteDialog({ open, onOpenChange, users }: BulkDeleteDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteUsers(users.map((u) => u.id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKey })
      onOpenChange(false)
      toast.success(`${users.length} users deleted.`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Users</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following {users.length} users?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto rounded-md border p-2">
          <ul className="space-y-1 text-sm">
            {users.map((u) => (
              <li key={u.id} className="rounded px-2 py-1 hover:bg-muted">
                {u.name} <span className="text-muted-foreground">({u.email})</span>
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
            {mutation.isPending ? "Deleting..." : `Delete ${users.length} Users`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
