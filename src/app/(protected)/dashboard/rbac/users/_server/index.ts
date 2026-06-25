import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  User,
  UserWithAssignments,
  UserBodyInput,
  CreateUserBodyInput,
  UserAssignmentDetail,
  PaginatedResponse,
  PaginationInput,
} from "./type";

export async function fetchUsers(
  params?: PaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" },
): Promise<PaginatedResponse<UserWithAssignments>> {
  const { data, error } = await api.users.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch users", error));
  }

  return data as PaginatedResponse<UserWithAssignments>;
}

export async function fetchUser(id: string): Promise<UserWithAssignments> {
  const { data, error } = await api.users({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch user", error));
  }

  return data as UserWithAssignments;
}

export async function createUser(
  input: CreateUserBodyInput,
): Promise<User> {
  const { data, error } = await api.users.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create user.", error));
  }

  return data as User;
}

export async function updateUser(
  id: string,
  input: Partial<UserBodyInput>,
): Promise<User> {
  const { data, error } = await api.users({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update user.", error));
  }

  return data as User;
}

export async function deleteUser(id: string): Promise<string> {
  const { error } = await api.users({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete user.", error));
  }

  return id;
}

export async function deleteUsers(ids: string[]): Promise<void> {
  const { error } = await api.users["bulk-delete"].post({ ids });

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete users", error));
  }
}

export async function fetchUserAssignments(
  userId: string,
  params?: PaginationInput,
): Promise<PaginatedResponse<UserAssignmentDetail>> {
  const { data, error } = await api.users({ id: userId }).assignments.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch user assignments", error));
  }

  return data as PaginatedResponse<UserAssignmentDetail>;
}
