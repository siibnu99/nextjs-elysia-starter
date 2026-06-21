import { and, count, eq, ilike } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { assignments, assignmentScopeItems, scopeItems } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import {
  assignmentBodySchema,
  assignmentScopeItemsBodySchema,
  assignmentPaginationSchema,
  type PaginatedResponse,
  type Assignment,
  type AssignmentScopeItem,
} from "./type";

async function validateScopeMode(
  scopeMode: string,
  scopeId: string | null | undefined,
  scopeItemIds: string[],
) {
  switch (scopeMode) {
    case "global":
      if (scopeItemIds.length > 0) {
        throw new Response("Global assignments cannot have scope items", { status: 400 });
      }
      break;
    case "single":
      if (!scopeId) {
        throw new Response("Single scope assignments require scopeId", { status: 400 });
      }
      if (scopeItemIds.length !== 1) {
        throw new Response("Single scope assignments require exactly one scope item", {
          status: 400,
        });
      }
      break;
    case "multiple":
      if (!scopeId) {
        throw new Response("Multiple scope assignments require scopeId", { status: 400 });
      }
      if (scopeItemIds.length < 1) {
        throw new Response("Multiple scope assignments require at least one scope item", {
          status: 400,
        });
      }
      break;
  }
}

export const assignmentsRouter = new Elysia({ prefix: "/assignments" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit, search, roleId, scopeId, scopeMode } =
        assignmentPaginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(assignments.name, `%${search}%`));
      }
      if (roleId) {
        conditions.push(eq(assignments.roleId, roleId));
      }
      if (scopeId) {
        conditions.push(eq(assignments.scopeId, scopeId));
      }
      if (scopeMode) {
        conditions.push(eq(assignments.scopeMode, scopeMode));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(assignments)
          .where(whereClause)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(assignments).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<Assignment>;
    },
    {
      query: assignmentPaginationSchema,
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, id));

      if (!assignment) {
        throw new Response("Assignment not found", { status: 404 });
      }

      const items = await db
        .select({
          id: assignmentScopeItems.id,
          assignmentId: assignmentScopeItems.assignmentId,
          scopeItemId: assignmentScopeItems.scopeItemId,
          createdAt: assignmentScopeItems.createdAt,
          scopeItem: {
            id: scopeItems.id,
            scopeId: scopeItems.scopeId,
            name: scopeItems.name,
            parentId: scopeItems.parentId,
            metadata: scopeItems.metadata,
          },
        })
        .from(assignmentScopeItems)
        .innerJoin(scopeItems, eq(assignmentScopeItems.scopeItemId, scopeItems.id))
        .where(eq(assignmentScopeItems.assignmentId, id));

      return {
        ...assignment,
        scopeItems: items,
      };
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const { scopeMode, scopeId, scopeItemIds, ...assignmentData } = body;

      await validateScopeMode(scopeMode, scopeId, scopeItemIds);

      const [data] = await db
        .insert(assignments)
        .values({
          ...assignmentData,
          scopeId: scopeId ?? null,
          scopeMode,
        })
        .returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      if (scopeItemIds.length > 0) {
        await db.insert(assignmentScopeItems).values(
          scopeItemIds.map((scopeItemId) => ({
            assignmentId: data.id,
            scopeItemId,
          })),
        );
      }

      return data;
    },
    {
      body: assignmentBodySchema.extend({
        scopeItemIds: z.array(z.string()).default([]),
      }),
      auth: true,
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;
      const { scopeMode, scopeId, scopeItemIds, ...assignmentData } = body;

      const [existing] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, id));

      if (!existing) {
        throw new Response("Assignment not found", { status: 404 });
      }

      const finalScopeMode = scopeMode ?? existing.scopeMode;
      const finalScopeId = scopeId !== undefined ? scopeId : existing.scopeId;

      if (scopeItemIds !== undefined) {
        await validateScopeMode(finalScopeMode, finalScopeId, scopeItemIds);

        await db
          .delete(assignmentScopeItems)
          .where(eq(assignmentScopeItems.assignmentId, id));

        if (scopeItemIds.length > 0) {
          await db.insert(assignmentScopeItems).values(
            scopeItemIds.map((scopeItemId) => ({
              assignmentId: id,
              scopeItemId,
            })),
          );
        }
      }

      const [updatedAssignment] = await db
        .update(assignments)
        .set({
          ...assignmentData,
          scopeId: finalScopeId,
          scopeMode: finalScopeMode,
        })
        .where(eq(assignments.id, id))
        .returning();

      if (!updatedAssignment) {
        throw new Response("Assignment not found", { status: 404 });
      }

      return updatedAssignment;
    },
    {
      body: assignmentBodySchema.partial().extend({
        scopeItemIds: z.array(z.string()).optional(),
      }),
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [deletedAssignment] = await db
        .delete(assignments)
        .where(eq(assignments.id, id))
        .returning();

      if (!deletedAssignment) {
        throw new Response("Assignment not found", { status: 404 });
      }

      return deletedAssignment;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .post(
    "/:id/scope-items",
    async ({ params, body }) => {
      const { id: assignmentId } = params;
      const { scopeItemIds } = body;

      const [assignment] = await db
        .select()
        .from(assignments)
        .where(eq(assignments.id, assignmentId));

      if (!assignment) {
        throw new Response("Assignment not found", { status: 404 });
      }

      if (assignment.scopeMode === "global") {
        throw new Response("Cannot add scope items to global assignment", { status: 400 });
      }

      const existingItems = await db
        .select()
        .from(assignmentScopeItems)
        .where(eq(assignmentScopeItems.assignmentId, assignmentId));

      const totalItems = existingItems.length + scopeItemIds.length;

      if (assignment.scopeMode === "single" && totalItems > 1) {
        throw new Response("Single scope assignment can only have one scope item", { status: 400 });
      }

      const newItems = scopeItemIds.map((scopeItemId) => ({
        assignmentId,
        scopeItemId,
      }));

      const data = await db.insert(assignmentScopeItems).values(newItems).returning();

      return data;
    },
    {
      body: assignmentScopeItemsBodySchema,
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/:id/scope-items/:scopeItemId",
    async ({ params }) => {
      const { id: assignmentId, scopeItemId } = params;

      const [deleted] = await db
        .delete(assignmentScopeItems)
        .where(
          and(
            eq(assignmentScopeItems.assignmentId, assignmentId),
            eq(assignmentScopeItems.scopeItemId, scopeItemId),
          ),
        )
        .returning();

      if (!deleted) {
        throw new Response("Assignment scope item not found", { status: 404 });
      }

      return deleted;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
        scopeItemId: z.string(),
      }),
    },
  );
