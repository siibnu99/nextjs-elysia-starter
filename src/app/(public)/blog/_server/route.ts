import { Elysia } from "elysia";

import { db } from "@/db";
import { posts } from "@/db/schema";

export const blogRouter = new Elysia({ prefix: "/blog" }).get("/", async () => {
  const blogData = await db.select().from(posts);

  if (!blogData) {
    throw new Response("Blog not found", { status: 404 });
  }

  return blogData;
});
