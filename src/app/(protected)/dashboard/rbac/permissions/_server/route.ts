import { count, eq, ilike } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { permissions } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import { permissionBodySchema, paginationSchema, type PaginatedResponse, type Permission } from "./type";

export const permissionsRouter = new Elysia({ prefix: "/permissions" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit, search } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(permissions.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(permissions)
          .where(whereClause)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(permissions).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<Permission>;
    },
    {
      query: paginationSchema,
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));

      if (!permission) {
        throw new Response("Permission not found", { status: 404 });
      }

      return permission;
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
      const [data] = await db.insert(permissions).values(body).returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: permissionBodySchema,
      auth: true,
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;

      const [updatedPermission] = await db
        .update(permissions)
        .set(body)
        .where(eq(permissions.id, id))
        .returning();

      if (!updatedPermission) {
        throw new Response("Permission not found", { status: 404 });
      }

      return updatedPermission;
    },
    {
      body: permissionBodySchema,
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

      const [deletedPermission] = await db
        .delete(permissions)
        .where(eq(permissions.id, id))
        .returning();

      if (!deletedPermission) {
        throw new Response("Permission not found", { status: 404 });
      }

      return deletedPermission;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  );
