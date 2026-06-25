import { z } from "zod";
import type { user } from "@/db/schema";
import type { assignments } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type User = typeof user.$inferSelect;

export type UserWithAssignments = User & {
  assignmentCount: number;
};

export type UserAssignmentDetail = {
  id: string;
  userId: string;
  assignmentId: string;
  createdAt: Date;
  assignment: typeof assignments.$inferSelect;
};

export const userBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  image: z.string().nullable().optional(),
});

export const createUserBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  image: z.string().nullable().optional(),
});

export type UserBodyInput = z.infer<typeof userBodySchema>;
export type CreateUserBodyInput = z.infer<typeof createUserBodySchema>;

export const usersQueryKey = ["users"] as const;
export const userAssignmentsQueryKey = (userId: string) =>
  ["users", userId, "assignments"] as const;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
