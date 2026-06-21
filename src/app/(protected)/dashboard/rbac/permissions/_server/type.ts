import { z } from "zod";
import type { permissions } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type Permission = typeof permissions.$inferSelect;

export const permissionBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type PermissionBodyInput = z.infer<typeof permissionBodySchema>;

export const permissionsQueryKey = ["permissions"] as const;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
