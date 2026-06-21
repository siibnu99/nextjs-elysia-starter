import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  UserAssignment,
  UserAssignmentWithDetails,
  UserAssignmentBodyInput,
  PaginatedResponse,
  PaginationInput,
} from "./type";

export async function fetchUserAssignments(
  userId: string,
  params?: PaginationInput,
): Promise<PaginatedResponse<UserAssignmentWithDetails>> {
  const { data, error } = await api["user-assignments"]({ userId }).get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch user assignments", error));
  }

  return data as PaginatedResponse<UserAssignmentWithDetails>;
}

export async function assignUserToAssignment(
  input: UserAssignmentBodyInput,
): Promise<UserAssignment> {
  const { data, error } = await api["user-assignments"].post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to assign user to assignment.", error));
  }

  return data as UserAssignment;
}

export async function removeUserFromAssignment(
  userId: string,
  assignmentId: string,
): Promise<{ userId: string; assignmentId: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (api["user-assignments"] as any)({ userId, assignmentId }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to remove user from assignment.", error));
  }

  return { userId, assignmentId };
}
