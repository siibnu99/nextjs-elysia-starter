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
import { deleteRoles } from "../_server"
import { rolesQueryKey, type Role } from "../_server/type"

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: Role[]
}

export function BulkDeleteDialog({ open, onOpenChange, roles }: BulkDeleteDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteRoles(roles.map((r) => r.id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      onOpenChange(false)
      toast.success(`${roles.length} roles deleted.`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Roles</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following {roles.length} roles?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto rounded-md border p-2">
          <ul className="space-y-1 text-sm">
            {roles.map((role) => (
              <li key={role.id} className="rounded px-2 py-1 hover:bg-muted">
                {role.name}
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
            {mutation.isPending ? "Deleting..." : `Delete ${roles.length} Roles`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
