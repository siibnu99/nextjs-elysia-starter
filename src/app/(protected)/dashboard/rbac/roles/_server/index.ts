import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type { Role, RoleBodyInput, PaginatedResponse, PaginationInput, Permission } from "./type";

export async function fetchRoles(
  params?: PaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" }
): Promise<PaginatedResponse<Role>> {
  const { data, error } = await api.roles.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch roles", error));
  }

  return data as PaginatedResponse<Role>;
}

export async function fetchRole(id: string): Promise<Role> {
  const { data, error } = await api.roles({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch role", error));
  }

  return data as Role;
}

export async function createRole(input: RoleBodyInput): Promise<Role> {
  const { data, error } = await api.roles.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create role.", error));
  }

  return data as Role;
}

export async function updateRole(id: string, input: RoleBodyInput): Promise<Role> {
  const { data, error } = await api.roles({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update role.", error));
  }

  return data as Role;
}

export async function deleteRole(id: string): Promise<string> {
  const { error } = await api.roles({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete role.", error));
  }

  return id;
}

export async function deleteRoles(ids: string[]): Promise<void> {
  const { error } = await api.roles["bulk-delete"].post({ ids });

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete roles", error));
  }
}

export async function fetchRolePermissions(roleId: string): Promise<Permission[]> {
  const { data, error } = await api.roles({ id: roleId }).permissions.get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch role permissions", error));
  }

  return (data ?? []) as Permission[];
}

export async function addPermissionToRole(roleId: string, permissionId: string) {
  const { data, error } = await api.roles({ id: roleId }).permissions.post({ permissionId });

  if (error) {
    throw new Error(extractErrorMessage("Failed to add permission to role.", error));
  }

  return data;
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const { error } = await api
    .roles({ id: roleId })
    .permissions({ permId: permissionId })
    .delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to remove permission from role.", error));
  }

  return { roleId, permissionId };
}
