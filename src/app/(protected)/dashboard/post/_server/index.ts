import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type { Post, PostCreateInput, PostUpdateInput } from "./type";

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await api.posts.get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch posts", error));
  }

  return data ?? [];
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  const { data, error } = await api.posts.post(input);

  if (error) {
    if (error.status === 401) {
      throw new Error("Session expired, please sign in again.");
    }

    throw new Error(extractErrorMessage("Failed to create post.", error));
  }

  return data as Post;
}

export async function updatePost(input: PostUpdateInput): Promise<Post> {
  const { data, error } = await api
    .posts({
      id: input.id,
    })
    .patch({
      name: input.name,
      content: input.content,
    });

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
