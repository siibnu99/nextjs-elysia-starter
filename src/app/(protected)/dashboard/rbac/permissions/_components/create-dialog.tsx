"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createPermission } from "../_server"
import { permissionsQueryKey, type PermissionBodyInput } from "../_server/type"
import { PermissionsForm } from "./permissions-form"

interface CreatePermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePermissionDialog({
  open,
  onOpenChange,
}: CreatePermissionDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: permissionsQueryKey })
      onOpenChange(false)
      toast.success("Permission created.")
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
          <DialogTitle>Create Permission</DialogTitle>
        </DialogHeader>
        <PermissionsForm
          mode="create"
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
