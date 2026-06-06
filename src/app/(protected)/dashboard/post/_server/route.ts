import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import { postBodySchema } from "./type";

export const postsRouter = new Elysia({ prefix: "/posts" })
  .use(authPlugin)
  .get("/", async () => {
    const postsData = await db.select().from(posts);

    if (!postsData) {
      throw new Response("Posts not found", { status: 404 });
    }

    return postsData;
  })
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
