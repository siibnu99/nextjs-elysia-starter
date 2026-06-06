import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { postsRouter } from "@/app/(protected)/dashboard/post/_server/route";
import { blogRouter } from "@/app/(public)/blog/_server/route";

export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_BASE_URL
          : true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposeHeaders: ["Set-Cookie"],
    }),
  )
  .use(postsRouter)
  .use(blogRouter);
export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
