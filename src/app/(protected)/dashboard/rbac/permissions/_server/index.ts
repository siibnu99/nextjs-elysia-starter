import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  Permission,
  PermissionBodyInput,
  PaginatedResponse,
  PaginationInput,
} from "./type";

export async function fetchPermissions(
  params?: PaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" }
): Promise<PaginatedResponse<Permission>> {
  const { data, error } = await api.permissions.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch permissions", error));
  }

  return data as PaginatedResponse<Permission>;
}

export async function fetchPermission(id: string): Promise<Permission> {
  const { data, error } = await api.permissions({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch permission", error));
  }

  return data as Permission;
}

export async function createPermission(input: PermissionBodyInput): Promise<Permission> {
  const { data, error } = await api.permissions.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create permission.", error));
  }

  return data as Permission;
}

export async function updatePermission(
  id: string,
  input: PermissionBodyInput
): Promise<Permission> {
  const { data, error } = await api.permissions({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update permission.", error));
  }

  return data as Permission;
}

export async function deletePermission(id: string): Promise<string> {
  const { error } = await api.permissions({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete permission.", error));
  }

  return id;
}

export async function deletePermissions(ids: string[]): Promise<void> {
  const { error } = await api.permissions["bulk-delete"].post({ ids });

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete permissions", error));
  }
}
