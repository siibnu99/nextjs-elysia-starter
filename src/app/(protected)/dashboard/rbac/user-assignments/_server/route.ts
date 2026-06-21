import { and, count, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { userAssignments, assignments } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import {
  userAssignmentBodySchema,
  paginationSchema,
  type PaginatedResponse,
  type UserAssignment,
  type UserAssignmentWithDetails,
} from "./type";

export const userAssignmentsRouter = new Elysia({ prefix: "/user-assignments" })
  .use(authPlugin)
  .get(
    "/:userId",
    async ({ params, query }) => {
      const { userId } = params;
      const { page, limit } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select({
            id: userAssignments.id,
            userId: userAssignments.userId,
            assignmentId: userAssignments.assignmentId,
            createdAt: userAssignments.createdAt,
            assignment: {
              id: assignments.id,
              roleId: assignments.roleId,
              scopeId: assignments.scopeId,
              scopeMode: assignments.scopeMode,
              name: assignments.name,
              createdAt: assignments.createdAt,
              updatedAt: assignments.updatedAt,
            },
          })
          .from(userAssignments)
          .innerJoin(assignments, eq(userAssignments.assignmentId, assignments.id))
          .where(eq(userAssignments.userId, userId))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(userAssignments)
          .where(eq(userAssignments.userId, userId)),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<UserAssignmentWithDetails>;
    },
    {
      params: z.object({
        userId: z.string(),
      }),
      query: paginationSchema,
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const { userId, assignmentId } = body;

      const [existing] = await db
        .select()
        .from(userAssignments)
        .where(
          and(
            eq(userAssignments.userId, userId),
            eq(userAssignments.assignmentId, assignmentId),
          ),
        );

      if (existing) {
        throw new Response("User already has this assignment", { status: 409 });
      }

      const [data] = await db
        .insert(userAssignments)
        .values({ userId, assignmentId })
        .returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: userAssignmentBodySchema,
      auth: true,
    },
  )
  .delete(
    "/:userId/:assignmentId",
    async ({ params }) => {
      const { userId, assignmentId } = params;

      const [deleted] = await db
        .delete(userAssignments)
        .where(
          and(
            eq(userAssignments.userId, userId),
            eq(userAssignments.assignmentId, assignmentId),
          ),
        )
        .returning();

      if (!deleted) {
        throw new Response("User assignment not found", { status: 404 });
      }

      return deleted;
    },
    {
      auth: true,
      params: z.object({
        userId: z.string(),
        assignmentId: z.string(),
      }),
    },
  );
