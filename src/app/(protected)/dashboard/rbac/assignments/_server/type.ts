import { z } from "zod";
import type { assignments, assignmentScopeItems } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type Assignment = typeof assignments.$inferSelect;
export type AssignmentScopeItem = typeof assignmentScopeItems.$inferSelect;

export const assignmentBodySchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  scopeId: z.string().nullable().optional(),
  scopeMode: z.enum(["global", "single", "multiple"]).default("single"),
  name: z.string().min(1, "Name is required"),
});

export const assignmentScopeItemBodySchema = z.object({
  scopeItemId: z.string().min(1, "Scope Item ID is required"),
});

export const assignmentScopeItemsBodySchema = z.object({
  scopeItemIds: z.array(z.string().min(1)).min(1, "At least one scope item is required"),
});

export type AssignmentBodyInput = z.infer<typeof assignmentBodySchema>;
export type AssignmentScopeItemBodyInput = z.infer<typeof assignmentScopeItemBodySchema>;
export type AssignmentScopeItemsBodyInput = z.infer<typeof assignmentScopeItemsBodySchema>;

export const assignmentsQueryKey = ["assignments"] as const;
export const assignmentScopeItemsQueryKey = (assignmentId: string) =>
  ["assignments", assignmentId, "scope-items"] as const;

export const assignmentPaginationSchema = paginationSchema.extend({
  roleId: z.string().optional(),
  scopeId: z.string().optional(),
  scopeMode: z.enum(["global", "single", "multiple"]).optional(),
});

export type AssignmentPaginationInput = z.infer<typeof assignmentPaginationSchema>;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
