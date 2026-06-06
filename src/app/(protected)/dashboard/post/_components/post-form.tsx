"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PostBodyInput } from "../_server/type";
import { postBodySchema } from "../_server/type";

export type PostFormProps = {
  mode: "create" | "edit";
  initialValues?: PostBodyInput;
  isSubmitting: boolean;
  onSubmit: (values: PostBodyInput) => void;
};

export function PostForm({
  mode,
  initialValues,
  isSubmitting,
  onSubmit,
}: PostFormProps) {
  const { handleSubmit, reset, control } = useForm<PostBodyInput>({
    resolver: zodResolver(postBodySchema),
    defaultValues: initialValues ?? {
      name: "",
      content: "",
    },
  });

  useEffect(() => {
    reset(
      initialValues ?? {
        name: "",
        content: "",
      },
    );
  }, [initialValues, reset]);

  const title = mode === "create" ? "Add post" : "Edit post";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="mb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Provide a concise title and short content for this post.
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${mode}-title`}>Title</FieldLabel>
              <Input
                {...field}
                id={`${mode}-title`}
                aria-invalid={fieldState.invalid}
                placeholder="Example: My first post"
                autoComplete="off"
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="content"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${mode}-content`}>Content</FieldLabel>
              <Textarea
                {...field}
                id={`${mode}-content`}
                aria-invalid={fieldState.invalid}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Write a short body for this post..."
              />
              {fieldState.invalid && fieldState.error && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create post"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
