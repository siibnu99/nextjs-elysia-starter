import { Elysia } from "elysia";
import { auth } from "@/lib/auth";

export const protectedRoute = (app: Elysia) =>
  app.derive(async ({ request, status }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) return status(401);

    return { session };
  });

export const authPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          session,
        };
      },
    },
  });
