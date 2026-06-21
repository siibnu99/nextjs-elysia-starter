import { z } from "zod";
import type { scopes, scopeItems } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type Scope = typeof scopes.$inferSelect;
export type ScopeItem = typeof scopeItems.$inferSelect;

export type ScopeItemWithChildren = ScopeItem & {
  children: ScopeItemWithChildren[];
};

export const scopeBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const scopeItemBodySchema = z.object({
  scopeId: z.string().min(1, "Scope ID is required"),
  name: z.string().min(1, "Name is required"),
  parentId: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ScopeBodyInput = z.infer<typeof scopeBodySchema>;
export type ScopeItemBodyInput = z.infer<typeof scopeItemBodySchema>;

export const scopesQueryKey = ["scopes"] as const;
export const scopeItemsQueryKey = (scopeId: string) => ["scopes", scopeId, "items"] as const;

export const MAX_TREE_DEPTH = 4;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
