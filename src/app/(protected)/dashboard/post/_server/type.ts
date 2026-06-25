import { z } from "zod";
import type { posts } from "@/db/schema";
import {
  type PaginatedResponse,
  type PaginationInput,
  paginationSchema,
} from "@/lib/types/pagination";

export type Post = typeof posts.$inferSelect;

export const postBodySchema = z.object({
  name: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type PostBodyInput = z.infer<typeof postBodySchema>;

export const postsQueryKey = ["posts"] as const;

export const postPaginationSchema = paginationSchema.extend({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type PostPaginationInput = z.infer<typeof postPaginationSchema>;

export { type PaginatedResponse, type PaginationInput, paginationSchema };
