"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { permissionBodySchema, type PermissionBodyInput } from "../_server/type"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface PermissionsFormProps {
  mode: "create" | "edit"
  initialValues?: PermissionBodyInput
  isSubmitting: boolean
  onSubmit: (values: PermissionBodyInput) => void
}

export function PermissionsForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: PermissionsFormProps) {
  const { handleSubmit, reset, control } = useForm<PermissionBodyInput>({
    resolver: zodResolver(permissionBodySchema),
    defaultValues: initialValues ?? { name: "", description: "" },
  })

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input {...field} id="name" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...field}
                value={field.value ?? ""}
                id="description"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create"
              : "Update"}
        </Button>
      </FieldGroup>
    </form>
  )
}
