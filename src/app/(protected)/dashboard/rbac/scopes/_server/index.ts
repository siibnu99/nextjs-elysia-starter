import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  Scope,
  ScopeItem,
  ScopeItemWithChildren,
  ScopeBodyInput,
  ScopeItemBodyInput,
  PaginatedResponse,
  PaginationInput,
} from "./type";

export async function fetchScopes(
  params?: PaginationInput & { sortBy?: string; sortOrder?: "asc" | "desc" }
): Promise<PaginatedResponse<Scope>> {
  const { data, error } = await api.scopes.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch scopes", error));
  }

  return data as PaginatedResponse<Scope>;
}

export async function fetchScope(id: string): Promise<Scope & { items: ScopeItemWithChildren[] }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch scope", error));
  }

  return data as Scope & { items: ScopeItemWithChildren[] };
}

export async function createScope(input: ScopeBodyInput): Promise<Scope> {
  const { data, error } = await api.scopes.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create scope.", error));
  }

  return data as Scope;
}

export async function updateScope(id: string, input: ScopeBodyInput): Promise<Scope> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update scope.", error));
  }

  return data as Scope;
}

export async function deleteScope(id: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (api.scopes as any)({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete scope.", error));
  }

  return id;
}

export async function fetchScopeItems(
  scopeId: string,
  params?: PaginationInput,
): Promise<PaginatedResponse<ScopeItem>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)({ id: scopeId }).items.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch scope items", error));
  }

  return data as PaginatedResponse<ScopeItem>;
}

export async function fetchScopeItem(id: string): Promise<ScopeItemWithChildren> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)["scope-items"]({ id }).get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch scope item", error));
  }

  return data as ScopeItemWithChildren;
}

export async function fetchScopeItemChildren(id: string): Promise<ScopeItemWithChildren[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)["scope-items"]({ id }).children.get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch scope item children", error));
  }

  return (data ?? []) as ScopeItemWithChildren[];
}

export async function createScopeItem(input: ScopeItemBodyInput): Promise<ScopeItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)["scope-items"].post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create scope item.", error));
  }

  return data as ScopeItem;
}

export async function updateScopeItem(id: string, input: Partial<ScopeItemBodyInput>): Promise<ScopeItem> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (api.scopes as any)["scope-items"]({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update scope item.", error));
  }

  return data as ScopeItem;
}

export async function deleteScopeItem(id: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (api.scopes as any)["scope-items"]({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete scope item.", error));
  }

  return id;
}
