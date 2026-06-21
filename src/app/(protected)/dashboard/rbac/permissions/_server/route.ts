import { asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
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
      const { page, limit, search, sortBy, sortOrder } = paginationSchema
        .extend({
          sortBy: z.string().optional(),
          sortOrder: z.enum(["asc", "desc"]).optional(),
        })
        .parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(permissions.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const sortableColumns: Record<
        string,
        | typeof permissions.name
        | typeof permissions.description
        | typeof permissions.createdAt
        | typeof permissions.updatedAt
      > = {
        name: permissions.name,
        description: permissions.description,
        createdAt: permissions.createdAt,
        updatedAt: permissions.updatedAt,
      };

      let orderByClause;
      if (sortBy && sortOrder) {
        const column = sortableColumns[sortBy];
        if (column) {
          orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
        }
      }

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(permissions)
          .where(whereClause)
          .orderBy(orderByClause ?? permissions.name)
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
      query: paginationSchema.extend({
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    },
  )
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = body;

      const deletedPermissions = await db
        .delete(permissions)
        .where(inArray(permissions.id, ids))
        .returning();

      return { deleted: deletedPermissions.length };
    },
    {
      body: z.object({
        ids: z.array(z.string()).min(1, "At least one permission ID is required"),
      }),
      auth: true,
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
