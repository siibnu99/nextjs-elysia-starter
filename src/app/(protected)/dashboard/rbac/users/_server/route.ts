import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { user, account, userAssignments, assignments } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import { auth } from "@/lib/auth";
import {
  userBodySchema,
  createUserBodySchema,
  paginationSchema,
  type PaginatedResponse,
  type User,
  type UserWithAssignments,
  type UserAssignmentDetail,
} from "./type";

export const usersRouter = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit, search, sortBy, sortOrder } = paginationSchema
        .extend({
          sortBy: z.string().optional(),
          sortOrder: z.enum(["asc", "desc"]).optional(),
        })
        .parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(
          or(
            ilike(user.name, `%${search}%`),
            ilike(user.email, `%${search}%`),
          ),
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const sortableColumns: Record<
        string,
        | typeof user.name
        | typeof user.email
        | typeof user.createdAt
        | typeof user.updatedAt
      > = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      let orderByClause;
      if (sortBy && sortOrder) {
        const column = sortableColumns[sortBy];
        if (column) {
          orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
        }
      }

      const [usersData, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(user)
          .where(whereClause)
          .orderBy(orderByClause ?? user.name)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(user).where(whereClause),
      ]);

      const userIds = usersData.map((u) => u.id);

      let assignmentCounts: Record<string, number> = {};
      if (userIds.length > 0) {
        const counts = await db
          .select({
            userId: userAssignments.userId,
            count: count(),
          })
          .from(userAssignments)
          .where(inArray(userAssignments.userId, userIds))
          .groupBy(userAssignments.userId);

        for (const row of counts) {
          assignmentCounts[row.userId] = row.count;
        }
      }

      const data: UserWithAssignments[] = usersData.map((u) => ({
        ...u,
        assignmentCount: assignmentCounts[u.id] ?? 0,
      }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<UserWithAssignments>;
    },
    {
      query: paginationSchema.extend({
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const newUser = await auth.api.createUser({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
          image: body.image ?? undefined,
        },
      });

      return newUser.user;
    },
    {
      body: createUserBodySchema,
      auth: true,
    },
  )
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = body;

      const deletedUsers = await db
        .delete(user)
        .where(inArray(user.id, ids))
        .returning();

      return { deleted: deletedUsers.length };
    },
    {
      body: z.object({
        ids: z.array(z.string()).min(1, "At least one user ID is required"),
      }),
      auth: true,
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [userData] = await db.select().from(user).where(eq(user.id, id));

      if (!userData) {
        throw new Response("User not found", { status: 404 });
      }

      const [{ count: assignmentCount }] = await db
        .select({ count: count() })
        .from(userAssignments)
        .where(eq(userAssignments.userId, id));

      return {
        ...userData,
        assignmentCount,
      } as UserWithAssignments;
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;

      const [updatedUser] = await db
        .update(user)
        .set(body)
        .where(eq(user.id, id))
        .returning();

      if (!updatedUser) {
        throw new Response("User not found", { status: 404 });
      }

      return updatedUser;
    },
    {
      body: userBodySchema.partial(),
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

      const [deletedUser] = await db
        .delete(user)
        .where(eq(user.id, id))
        .returning();

      if (!deletedUser) {
        throw new Response("User not found", { status: 404 });
      }

      return deletedUser;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .get(
    "/:id/assignments",
    async ({ params, query }) => {
      const { id } = params;
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
          .where(eq(userAssignments.userId, id))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(userAssignments)
          .where(eq(userAssignments.userId, id)),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<UserAssignmentDetail>;
    },
    {
      params: z.object({
        id: z.string(),
      }),
      query: paginationSchema,
    },
  );
