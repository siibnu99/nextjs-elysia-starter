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
import { deletePermissions } from "../_server"
import { permissionsQueryKey, type Permission } from "../_server/type"

interface BulkDeletePermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permissions: Permission[]
}

export function BulkDeletePermissionDialog({
  open,
  onOpenChange,
  permissions,
}: BulkDeletePermissionDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deletePermissions(permissions.map((p) => p.id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: permissionsQueryKey })
      onOpenChange(false)
      toast.success(`${permissions.length} permissions deleted.`)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Delete Permissions</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the following {permissions.length}{" "}
            permissions? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto rounded-md border p-2">
          <ul className="space-y-1 text-sm">
            {permissions.map((permission) => (
              <li
                key={permission.id}
                className="rounded px-2 py-1 hover:bg-muted"
              >
                {permission.name}
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
              : `Delete ${permissions.length} Permissions`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
