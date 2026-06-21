import { z } from "zod";
import type { userAssignments, assignments } from "@/db/schema";
import { paginationSchema, type PaginationInput, type PaginatedResponse } from "@/lib/types/pagination";

export type UserAssignment = typeof userAssignments.$inferSelect;

export type UserAssignmentWithDetails = UserAssignment & {
  assignment: typeof assignments.$inferSelect;
};

export const userAssignmentBodySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  assignmentId: z.string().min(1, "Assignment ID is required"),
});

export type UserAssignmentBodyInput = z.infer<typeof userAssignmentBodySchema>;

export const userAssignmentsQueryKey = (userId: string) => ["user-assignments", userId] as const;

export { paginationSchema, type PaginationInput, type PaginatedResponse };
