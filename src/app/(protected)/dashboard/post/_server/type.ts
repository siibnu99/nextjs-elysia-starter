import { z } from "zod";
import type { posts } from "@/db/schema";

export type Post = typeof posts.$inferSelect;

export const postBodySchema = z.object({
  name: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type PostBodyInput = z.infer<typeof postBodySchema>;

export type PostCreateInput = PostBodyInput;
export type PostUpdateInput = PostBodyInput & Pick<Post, "id">;

export const postsQueryKey = ["posts"] as const;
