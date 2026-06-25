import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import {
  type PaginatedResponse,
  type Post,
  paginationSchema,
  postBodySchema,
} from "./type";

export const postsRouter = new Elysia({ prefix: "/posts" })
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
            ilike(posts.name, `%${search}%`),
            ilike(posts.content, `%${search}%`),
          ),
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const sortableColumns: Record<
        string,
        typeof posts.name | typeof posts.createdAt | typeof posts.updatedAt
      > = {
        name: posts.name,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
      };

      let orderByClause: ReturnType<typeof asc> | undefined;
      if (sortBy && sortOrder) {
        const column = sortableColumns[sortBy];
        if (column) {
          orderByClause = sortOrder === "asc" ? asc(column) : desc(column);
        }
      }

      const [postsData, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(posts)
          .where(whereClause)
          .orderBy(orderByClause ?? posts.createdAt)
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(posts).where(whereClause),
      ]);

      return {
        data: postsData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      } as PaginatedResponse<Post>;
    },
    {
      query: paginationSchema.extend({
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      }),
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const { id } = params;

      const [post] = await db.select().from(posts).where(eq(posts.id, id));

      if (!post) {
        throw new Response("Post not found", { status: 404 });
      }

      return post;
    },
    {
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .post(
    "/",
    async ({ body, session }) => {
      const { name, content } = body;
      const { id: userId } = session.user;

      const [data] = await db
        .insert(posts)
        .values({
          name,
          content,
          userId,
        })
        .returning();

      if (!data) {
        throw new Response("Internal Error", { status: 500 });
      }

      return data;
    },
    {
      body: postBodySchema,
      auth: true,
    },
  )
  .post(
    "/bulk-delete",
    async ({ body }) => {
      const { ids } = body;

      const deletedPosts = await db
        .delete(posts)
        .where(inArray(posts.id, ids))
        .returning();

      return { deleted: deletedPosts.length };
    },
    {
      body: z.object({
        ids: z.array(z.string()).min(1, "At least one post ID is required"),
      }),
      auth: true,
    },
  )
  .patch(
    "/:id",
    async ({ params, body, session }) => {
      const { id } = params;
      const { name, content } = body;
      const { id: userId } = session.user;

      const [updatedPost] = await db
        .update(posts)
        .set({
          name,
          content,
        })
        .where(and(eq(posts.id, id), eq(posts.userId, userId)))
        .returning();

      if (!updatedPost) {
        throw new Response("Post not found", { status: 404 });
      }

      return updatedPost;
    },
    {
      body: postBodySchema,
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params, session }) => {
      const { id } = params;
      const { id: userId } = session.user;

      const [deletedPost] = await db
        .delete(posts)
        .where(and(eq(posts.id, id), eq(posts.userId, userId)))
        .returning();

      if (!deletedPost) {
        throw new Response("Post not found", { status: 404 });
      }

      return deletedPost;
    },
    {
      auth: true,
      params: z.object({
        id: z.string(),
      }),
    },
  );
