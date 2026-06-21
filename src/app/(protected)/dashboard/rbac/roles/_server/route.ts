import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { roles, rolePermissions, permissions } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import { roleBodySchema, paginationSchema, type PaginatedResponse, type Role } from "./type";

export const rolesRouter = new Elysia({ prefix: "/roles" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit, search, sortBy, sortOrder } = paginationSchema.extend({
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }).parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(roles.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const sortableColumns: Record<string, typeof roles.name | typeof roles.description | typeof roles.createdAt | typeof roles.updatedAt> = {
        name: roles.name,
        description: roles.description,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
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
          .from(roles)
          .where(whereClause)
          .orderBy(orderByClause ?? roles.name)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(roles).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<Role>;
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

      const deletedRoles = await db
        .delete(roles)
        .where(inArray(roles.id, ids))
        .returning();

      return { deleted: deletedRoles.length };
    },
    {
      body: z.object({
        ids: z.array(z.string()).min(1, "At least one role ID is required"),
      }),
      auth: true,
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [role] = await db.select().from(roles).where(eq(roles.id, id));

      if (!role) {
        throw new Response("Role not found", { status: 404 });
      }

      return role;
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
      const [data] = await db.insert(roles).values(body).returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: roleBodySchema,
      auth: true,
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;

      const [updatedRole] = await db
        .update(roles)
        .set(body)
        .where(eq(roles.id, id))
        .returning();

      if (!updatedRole) {
        throw new Response("Role not found", { status: 404 });
      }

      return updatedRole;
    },
    {
      body: roleBodySchema,
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

      const [deletedRole] = await db
        .delete(roles)
        .where(eq(roles.id, id))
        .returning();

      if (!deletedRole) {
        throw new Response("Role not found", { status: 404 });
      }

      return deletedRole;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .get(
    "/:id/permissions",
    async ({ params }) => {
      const { id } = params;

      const rolePerms = await db
        .select({
          id: permissions.id,
          name: permissions.name,
          description: permissions.description,
          createdAt: permissions.createdAt,
          updatedAt: permissions.updatedAt,
        })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
        .where(eq(rolePermissions.roleId, id));

      return rolePerms;
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .post(
    "/:id/permissions",
    async ({ params, body }) => {
      const { id: roleId } = params;
      const { permissionId } = body;

      const [data] = await db
        .insert(rolePermissions)
        .values({ roleId, permissionId })
        .returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: z.object({
        permissionId: z.string().min(1, "Permission ID is required"),
      }),
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/:id/permissions/:permId",
    async ({ params }) => {
      const { id: roleId, permId: permissionId } = params;

      const [deleted] = await db
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            eq(rolePermissions.permissionId, permissionId),
          ),
        )
        .returning();

      if (!deleted) {
        throw new Response("Role permission not found", { status: 404 });
      }

      return deleted;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
        permId: z.string(),
      }),
    },
  );
