"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updatePermission } from "../_server"
import {
  permissionsQueryKey,
  type Permission,
  type PermissionBodyInput,
} from "../_server/type"
import { PermissionsForm } from "./permissions-form"

interface EditPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission: Permission
}

export function EditPermissionDialog({
  open,
  onOpenChange,
  permission,
}: EditPermissionDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: PermissionBodyInput) =>
      updatePermission(permission.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: permissionsQueryKey })
      onOpenChange(false)
      toast.success("Permission updated.")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleSubmit(values: PermissionBodyInput) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
        </DialogHeader>
        <PermissionsForm
          mode="edit"
          initialValues={{
            name: permission.name,
            description: permission.description ?? "",
          }}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
