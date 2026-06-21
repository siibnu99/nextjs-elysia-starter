import { z } from "zod";
import type { roles, permissions } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;

export const roleBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const permissionBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type RoleBodyInput = z.infer<typeof roleBodySchema>;
export type PermissionBodyInput = z.infer<typeof permissionBodySchema>;

export const rolesQueryKey = ["roles"] as const;
export const rolePermissionsQueryKey = (roleId: string) => ["roles", roleId, "permissions"] as const;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
