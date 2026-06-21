import { count, eq, ilike } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { scopes, scopeItems } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import {
  scopeBodySchema,
  scopeItemBodySchema,
  paginationSchema,
  MAX_TREE_DEPTH,
  type PaginatedResponse,
  type Scope,
  type ScopeItem,
  type ScopeItemWithChildren,
} from "./type";

async function buildScopeItemTree(
  scopeId: string,
  parentId: string | null = null,
  depth = 0,
): Promise<ScopeItemWithChildren[]> {
  if (depth >= MAX_TREE_DEPTH) return [];

  const items = await db
    .select()
    .from(scopeItems)
    .where(eq(scopeItems.scopeId, scopeId));

  function buildTree(parent: string | null, currentDepth: number): ScopeItemWithChildren[] {
    if (currentDepth >= MAX_TREE_DEPTH) return [];

    return items
      .filter((item) => item.parentId === parent)
      .map((item) => ({
        ...item,
        children: buildTree(item.id, currentDepth + 1),
      }));
  }

  return buildTree(parentId, depth);
}

export const scopesRouter = new Elysia({ prefix: "/scopes" })
  .use(authPlugin)
  .get(
    "/",
    async ({ query }) => {
      const { page, limit, search } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const conditions = [];
      if (search) {
        conditions.push(ilike(scopes.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(scopes)
          .where(whereClause)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(scopes).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<Scope>;
    },
    {
      query: paginationSchema,
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [scope] = await db.select().from(scopes).where(eq(scopes.id, id));

      if (!scope) {
        throw new Response("Scope not found", { status: 404 });
      }

      const itemsTree = await buildScopeItemTree(id);

      return {
        ...scope,
        items: itemsTree,
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
      const [data] = await db.insert(scopes).values(body).returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: scopeBodySchema,
      auth: true,
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const { id } = params;

      const [updatedScope] = await db
        .update(scopes)
        .set(body)
        .where(eq(scopes.id, id))
        .returning();

      if (!updatedScope) {
        throw new Response("Scope not found", { status: 404 });
      }

      return updatedScope;
    },
    {
      body: scopeBodySchema,
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

      const [deletedScope] = await db
        .delete(scopes)
        .where(eq(scopes.id, id))
        .returning();

      if (!deletedScope) {
        throw new Response("Scope not found", { status: 404 });
      }

      return deletedScope;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .get(
    "/:id/items",
    async ({ params, query }) => {
      const { id } = params;
      const { page, limit, search } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const conditions = [eq(scopeItems.scopeId, id)];
      if (search) {
        conditions.push(ilike(scopeItems.name, `%${search}%`));
      }

      const whereClause = conditions.length > 0 ? conditions[0] : undefined;

      const [data, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(scopeItems)
          .where(whereClause)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(scopeItems).where(whereClause),
      ]);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<ScopeItem>;
    },
    {
      params: z.object({
        id: z.string(),
      }),
      query: paginationSchema,
    },
  )
  .get(
    "/scope-items/:id",
    async ({ params }) => {
      const { id } = params;

      const [item] = await db
        .select()
        .from(scopeItems)
        .where(eq(scopeItems.id, id));

      if (!item) {
        throw new Response("Scope item not found", { status: 404 });
      }

      const children = await buildScopeItemTree(item.scopeId, id, 0);

      return {
        ...item,
        children,
      } as ScopeItemWithChildren;
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .get(
    "/scope-items/:id/children",
    async ({ params }) => {
      const { id } = params;

      const [item] = await db
        .select()
        .from(scopeItems)
        .where(eq(scopeItems.id, id));

      if (!item) {
        throw new Response("Scope item not found", { status: 404 });
      }

      const children = await buildScopeItemTree(item.scopeId, id, 0);

      return children;
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .post(
    "/scope-items",
    async ({ body }) => {
      const [data] = await db.insert(scopeItems).values(body).returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: scopeItemBodySchema,
      auth: true,
    },
  )
  .patch(
    "/scope-items/:id",
    async ({ params, body }) => {
      const { id } = params;

      const [updatedItem] = await db
        .update(scopeItems)
        .set(body)
        .where(eq(scopeItems.id, id))
        .returning();

      if (!updatedItem) {
        throw new Response("Scope item not found", { status: 404 });
      }

      return updatedItem;
    },
    {
      body: scopeItemBodySchema.partial(),
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/scope-items/:id",
    async ({ params }) => {
      const { id } = params;

      const [deletedItem] = await db
        .delete(scopeItems)
        .where(eq(scopeItems.id, id))
        .returning();

      if (!deletedItem) {
        throw new Response("Scope item not found", { status: 404 });
      }

      return deletedItem;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  );
