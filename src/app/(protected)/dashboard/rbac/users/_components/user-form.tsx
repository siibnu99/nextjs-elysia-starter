"use client"

import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { userBodySchema, createUserBodySchema, type UserBodyInput, type CreateUserBodyInput } from "../_server/type"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const editFormSchema = userBodySchema.extend({
  image: z.string().nullable().optional(),
});

const createFormSchema = createUserBodySchema;

type EditFormValues = z.infer<typeof editFormSchema>;
type CreateFormValues = z.infer<typeof createFormSchema>;

interface UserFormProps {
  mode: "create" | "edit"
  initialValues?: { name: string; email: string; image?: string | null }
  isSubmitting: boolean
  onSubmit: (values: CreateUserBodyInput | UserBodyInput) => void
}

export function UserForm({ mode, initialValues, isSubmitting, onSubmit }: UserFormProps) {
  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      image: null,
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      email: "",
      image: null,
    },
  })

  useEffect(() => {
    if (initialValues && mode === "edit") {
      editForm.reset({
        name: initialValues.name,
        email: initialValues.email,
        image: initialValues.image ?? null,
      })
    }
  }, [initialValues, mode, editForm])

  if (mode === "create") {
    return (
      <form onSubmit={createForm.handleSubmit((values) => onSubmit(values as CreateUserBodyInput))}>
        <FieldGroup>
          <Controller
            name="name"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input {...field} id="name" placeholder="John Doe" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input {...field} id="email" type="email" placeholder="john@example.com" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input {...field} id="password" type="password" placeholder="Min. 8 characters" aria-invalid={fieldState.invalid} />
                {fieldState.invalid && fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={editForm.handleSubmit((values) => onSubmit(values as UserBodyInput))}>
      <FieldGroup>
        <Controller
          name="name"
          control={editForm.control}
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
          name="email"
          control={editForm.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input {...field} id="email" type="email" disabled aria-invalid={fieldState.invalid} />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Update"}
        </Button>
      </FieldGroup>
    </form>
  )
}
