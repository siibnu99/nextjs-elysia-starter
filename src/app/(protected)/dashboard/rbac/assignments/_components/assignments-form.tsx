"use client"

import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { fetchRoles } from "../../roles/_server"
import { fetchScopes, fetchScopeItems } from "../../scopes/_server"
import { rolesQueryKey } from "../../roles/_server/type"
import { scopesQueryKey } from "../../scopes/_server/type"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select"

const assignmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roleId: z.string().min(1, "Role is required"),
  scopeId: z.string().nullable(),
  scopeMode: z.enum(["global", "single", "multiple"]),
  scopeItemIds: z.array(z.string()),
})

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

interface AssignmentsFormProps {
  mode: "create" | "edit"
  initialValues?: AssignmentFormValues
  isSubmitting: boolean
  onSubmit: (values: AssignmentFormValues) => void
}

export function AssignmentsForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: AssignmentsFormProps) {
  const [step, setStep] = useState(1)
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(
    initialValues?.scopeId ?? null
  )

  const { handleSubmit, watch, setValue, control, formState: { errors } } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: initialValues ?? {
      name: "",
      roleId: "",
      scopeId: null,
      scopeMode: "single",
      scopeItemIds: [],
    },
  })

  const scopeMode = watch("scopeMode")
  const scopeId = watch("scopeId")

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: rolesQueryKey,
    queryFn: () => fetchRoles({ page: 1, limit: 100 }),
  })

  // Fetch scopes
  const { data: scopesData } = useQuery({
    queryKey: scopesQueryKey,
    queryFn: () => fetchScopes({ page: 1, limit: 100 }),
  })

  // Fetch scope items when scopeId changes
  const { data: scopeItemsData } = useQuery({
    queryKey: [...scopesQueryKey, scopeId, "items"],
    queryFn: () => fetchScopeItems(scopeId!, { page: 1, limit: 100 }),
    enabled: !!scopeId && scopeMode !== "global",
  })

  const roles = rolesData?.data ?? []
  const scopes = scopesData?.data ?? []
  const scopeItems = scopeItemsData?.data ?? []

  useEffect(() => {
    if (initialValues) {
      setSelectedScopeId(initialValues.scopeId)
    }
  }, [initialValues])

  function handleNext() {
    if (step === 1 && !watch("name")) return
    if (step === 2 && !watch("roleId")) return
    setStep(step + 1)
  }

  function handleBack() {
    setStep(step - 1)
  }

  function handleFormSubmit(values: AssignmentFormValues) {
    onSubmit({
      ...values,
      scopeId: scopeMode === "global" ? null : values.scopeId,
      scopeItemIds: scopeMode === "global" ? [] : values.scopeItemIds,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup>
        {/* Step 1: Name & Role */}
        {step === 1 && (
          <>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Assignment Name</FieldLabel>
                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g., Admin Fakultas Teknik"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="roleId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="roleId">Role</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="roleId" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex justify-end">
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Scope Mode */}
        {step === 2 && (
          <>
            <Controller
              name="scopeMode"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="scopeMode">Scope Mode</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === "global") {
                        setValue("scopeId", null)
                        setValue("scopeItemIds", [])
                      }
                    }}
                  >
                    <SelectTrigger id="scopeMode">
                      <SelectValue placeholder="Select scope mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global (no scope)</SelectItem>
                      <SelectItem value="single">Single (one scope item)</SelectItem>
                      <SelectItem value="multiple">Multiple (many scope items)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {scopeMode !== "global" && (
              <Controller
                name="scopeId"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="scopeId">Scope Type</FieldLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value)
                        setSelectedScopeId(value)
                        setValue("scopeItemIds", [])
                      }}
                    >
                      <SelectTrigger id="scopeId" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select a scope type" />
                      </SelectTrigger>
                      <SelectContent>
                        {scopes.map((scope) => (
                          <SelectItem key={scope.id} value={scope.id}>
                            {scope.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Scope Items */}
        {step === 3 && (
          <>
            {scopeMode === "global" ? (
              <div className="text-sm text-muted-foreground py-4">
                This assignment has global scope - no scope items needed.
              </div>
            ) : (
              <Controller
                name="scopeItemIds"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="scopeItemIds">
                      Scope Items {scopeMode === "single" ? "(select one)" : "(select multiple)"}
                    </FieldLabel>
                    <MultiSelect
                      values={field.value}
                      onValuesChange={field.onChange}
                    >
                      <MultiSelectTrigger id="scopeItemIds" aria-invalid={fieldState.invalid}>
                        <MultiSelectValue placeholder="Select scope items" />
                      </MultiSelectTrigger>
                      <MultiSelectContent>
                        {scopeItems.map((item) => (
                          <MultiSelectItem key={item.id} value={item.id}>
                            {item.name}
                          </MultiSelectItem>
                        ))}
                      </MultiSelectContent>
                    </MultiSelect>
                    {fieldState.invalid && fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </>
        )}
      </FieldGroup>
    </form>
  )
}
