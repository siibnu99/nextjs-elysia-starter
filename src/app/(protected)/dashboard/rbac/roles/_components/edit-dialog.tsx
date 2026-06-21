"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateRole } from "../_server"
import { rolesQueryKey, type Role, type RoleBodyInput } from "../_server/type"
import { RoleForm } from "./role-form"

interface EditRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role
}

export function EditRoleDialog({ open, onOpenChange, role }: EditRoleDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (values: RoleBodyInput) => updateRole(role.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKey })
      onOpenChange(false)
      toast.success("Role updated.")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  function handleSubmit(values: RoleBodyInput) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <RoleForm
          mode="edit"
          initialValues={{ name: role.name, description: role.description ?? "" }}
          isSubmitting={mutation.isPending}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
