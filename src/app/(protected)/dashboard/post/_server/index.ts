import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type {
  PaginatedResponse,
  Post,
  PostBodyInput,
  PostPaginationInput,
} from "./type";

export async function fetchPosts(
  params?: PostPaginationInput,
): Promise<PaginatedResponse<Post>> {
  const { data, error } = await api.posts.get({
    query: params ?? { page: 1, limit: 10 },
  });

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch posts", error));
  }

  return data as PaginatedResponse<Post>;
}

export async function createPost(input: PostBodyInput): Promise<Post> {
  const { data, error } = await api.posts.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create post.", error));
  }

  return data as Post;
}

export async function updatePost(
  id: string,
  input: PostBodyInput,
): Promise<Post> {
  const { data, error } = await api.posts({ id }).patch(input);

  if (error) {
    throw new Error(extractErrorMessage("Failed to update post.", error));
  }

  return data as Post;
}

export async function deletePost(id: string): Promise<string> {
  const { error } = await api.posts({ id }).delete();

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete post.", error));
  }

  return id;
}

export async function deletePosts(ids: string[]): Promise<void> {
  const { error } = await api.posts["bulk-delete"].post({ ids });

  if (error) {
    throw new Error(extractErrorMessage("Failed to delete posts", error));
  }
}
