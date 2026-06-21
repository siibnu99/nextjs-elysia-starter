import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  Assignment,
  AssignmentBodyInput,
  AssignmentScopeItem,
  PaginatedResponse,
  AssignmentPaginationInput,
} from "./type";

export async function fetchAssignments(
  params?: AssignmentPaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" },
): Promise<PaginatedResponse<Assignment>> {
  const { data, error } = await api.assignments.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch assignments", error));
  }

  return data as PaginatedResponse<Assignment>;
}

export async function fetchAssignment(
  id: string,
): Promise<Assignment & { scopeItems: AssignmentScopeItem[] }> {
  const { data, error } = await api.assignments({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch assignment", error));
  }

  return data as Assignment & { scopeItems: AssignmentScopeItem[] };
}

export async function createAssignment(
  input: AssignmentBodyInput & { scopeItemIds?: string[] },
): Promise<Assignment> {
  const { data, error } = await api.assignments.post({
    ...input,
    scopeItemIds: input.scopeItemIds ?? [],
  });

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create assignment.", error));
  }

  return data as Assignment;
}

export async function updateAssignment(
  id: string,
  input: Partial<AssignmentBodyInput> & { scopeItemIds?: string[] },
): Promise<Assignment> {
  const { data, error } = await api.assignments({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update assignment.", error));
  }

  return data as Assignment;
}

export async function deleteAssignment(id: string): Promise<string> {
  const { error } = await api.assignments({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete assignment.", error));
  }

  return id;
}

export async function deleteAssignments(ids: string[]): Promise<void> {
  const { error } = await api.assignments["bulk-delete"].post({ ids });

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete assignments", error));
  }
}

export async function addScopeItemsToAssignment(
  assignmentId: string,
  scopeItemIds: string[],
) {
  const { data, error } = await api
    .assignments({ id: assignmentId })
    ["scope-items"].post({ scopeItemIds });

  if (error) {
    throw new Error(extractErrorMessage("Failed to add scope items to assignment.", error));
  }

  return data;
}

export async function removeScopeItemFromAssignment(
  assignmentId: string,
  scopeItemId: string,
) {
  const { error } = await api
    .assignments({ id: assignmentId })
    ["scope-items"]({ scopeItemId })
    .delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to remove scope item from assignment.", error));
  }

  return { assignmentId, scopeItemId };
}
