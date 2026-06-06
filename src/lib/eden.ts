import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slugs]]/route";

// Client-safe Eden instance: always talks to HTTP URL,
// and only uses `app` as a TYPE (no server code in browser bundle).
export const api = treaty<typeof app>(
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
).api;
