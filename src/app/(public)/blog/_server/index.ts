import type { Post } from "@/app/(protected)/dashboard/post/_server/type";
import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";

export async function fetchBlogs(): Promise<Post[]> {
  const { data, error } = await api.posts.get();

  if (error) {
    throw new Error(extractErrorMessage("Failed to fetch posts", error));
  }

  return data ?? [];
}
