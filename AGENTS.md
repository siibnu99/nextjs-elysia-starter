# AGENTS.md — Project Conventions

## Package Manager

**Always use `pnpm`.** Never use npm, yarn, or bun.

```bash
pnpm install          # install dependencies
pnpm dev              # start dev server
pnpm build            # production build (validation target)
pnpm lint             # check with biome
pnpm format           # format with biome
pnpm drizzle-kit ...  # drizzle CLI commands
```

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| Framework | Next.js (App Router) | 16.x |
| API | Elysia + @elysiajs/cors + @elysiajs/eden | 1.4.x |
| Auth | better-auth | 1.6.x |
| Database | Drizzle ORM + postgres (Supabase/Neon) | 0.45.x |
| Data Fetching | @tanstack/react-query + superjson | 5.x |
| Forms | react-hook-form + @hookform/resolvers/zod | 7.x |
| Validation | Zod | 3.x |
| UI | shadcn/ui (radix-nova) + Tailwind CSS v4 | 4.x |
| Icons | Lucide React | latest |
| Linter/Formatter | Biome | 2.x |
| ID Generation | nanoid | 5.x |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, ReactQueryProvider, SonnerToaster)
│   ├── globals.css             # Tailwind + shadcn theme (CSS variables)
│   ├── (public)/               # Public pages (no auth required)
│   │   ├── page.tsx            # Home page (/)
│   │   └── blog/
│   │       ├── page.tsx        # Blog listing (/blog)
│   │       ├── _server/        # Data fetching + Elysia route
│   │       └── _components/    # UI components
│   ├── (auth)/                 # Auth pages (redirects to /dashboard if logged in)
│   │   ├── layout.tsx          # Session guard → redirect if authenticated
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/            # Protected pages (redirects to /login if not logged in)
│   │   ├── layout.tsx          # Session guard → redirect if not authenticated
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── post/
│   │   │       ├── page.tsx
│   │   │       ├── _server/    # route.ts, type.ts, index.ts
│   │   │       └── _components/
│   │   └── settings/
│   └── api/
│       ├── [[...slugs]]/route.ts   # Elysia catch-all (registers all routers)
│       └── auth/[...all]/route.ts  # Better Auth handler
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── react-query-provider.tsx
│   ├── sonner-provider.tsx
│   └── logout-button.tsx
├── db/
│   ├── index.ts                # Drizzle instance (`export const db`)
│   └── schema.ts               # All table definitions + relations
├── lib/
│   ├── auth.ts                 # Better Auth server instance
│   ├── auth-client.ts          # Better Auth React client
│   ├── eden.ts                 # Eden treaty client (type-safe API calls)
│   ├── query-client.ts         # React Query client factory
│   └── utils.ts                # cn(), extractErrorMessage()
└── server/
    └── protected-route.ts      # authPlugin (Elysia macro for auth)
```

---

## Feature Module Pattern (Colocation)

Every feature module follows this structure:

```
feature/
├── page.tsx            # Next.js page (thin wrapper)
├── _server/
│   ├── route.ts        # Elysia router (backend)
│   ├── type.ts         # Zod schemas, TypeScript types, query keys
│   └── index.ts        # Client-side data fetching functions (uses Eden)
└── _components/
    ├── feature-page.tsx    # Main client component
    ├── feature-form.tsx    # Form component
    └── ...                 # Dialogs, cards, etc.
```

### `_server/route.ts` — Elysia Router

```typescript
import { Elysia } from "elysia";
import z from "zod";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { authPlugin } from "@/server/protected-route";
import { postBodySchema } from "./type";

export const postsRouter = new Elysia({ prefix: "/posts" })
  .use(authPlugin)
  .get("/", async () => {
    return await db.select().from(posts);
  })
  .post(
    "/",
    async ({ body, session }) => {
      // session is available because auth: true
      const [data] = await db.insert(posts).values({ ...body, userId: session.user.id }).returning();
      return data;
    },
    { body: postBodySchema, auth: true },  // auth: true enables the macro
  );
```

- Always export the router as a named const
- Register it in `src/app/api/[[...slugs]]/route.ts` with `.use(routerName)`
- Use `auth: true` in handler options for protected endpoints
- Use Zod for `params` and `body` validation

### `_server/type.ts` — Types & Schemas

```typescript
import { z } from "zod";
import type { posts } from "@/db/schema";

export type Post = typeof posts.$inferSelect;

export const postBodySchema = z.object({
  name: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export type PostBodyInput = z.infer<typeof postBodySchema>;
export type PostCreateInput = PostBodyInput;
export type PostUpdateInput = PostBodyInput & Pick<Post, "id">;

export const postsQueryKey = ["posts"] as const;
```

- Infer types from Drizzle schema with `$inferSelect`
- Export Zod schemas for validation
- Export query keys as `const` arrays

### `_server/index.ts` — Client Data Fetching

```typescript
import { api } from "@/lib/eden";
import { extractErrorMessage } from "@/lib/utils";
import type { Post } from "./type";

export async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await api.posts.get();
  if (error) throw new Error(extractErrorMessage("Failed to fetch posts", error));
  return data ?? [];
}
```

- Use Eden client (`api`) for type-safe HTTP calls
- Always handle errors with `extractErrorMessage`
- Return typed data

---

## API Route Registration

All Elysia routers are registered in `src/app/api/[[...slugs]]/route.ts`:

```typescript
import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { postsRouter } from "@/app/(protected)/dashboard/post/_server/route";
import { blogRouter } from "@/app/(public)/blog/_server/route";

export const app = new Elysia({ prefix: "/api" })
  .use(cors({ ... }))
  .use(postsRouter)
  .use(blogRouter);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;
```

- `app` is exported as a **type** for Eden client (`typeof app`)
- All HTTP methods map to `app.fetch`

---

## Authentication

### Server — Better Auth

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(db, { provider: "pg", schema: { ...schema } }),
});
```

### Client — Better Auth React

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({});
```

### Elysia Auth Plugin (macro)

```typescript
// src/server/protected-route.ts
export const authPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return { session };
      },
    },
  });
```

- Use `auth: true` in Elysia handler options to require authentication
- `session` is automatically available in the handler context

### Route Group Guards

- `(auth)/layout.tsx` — redirects to `/dashboard` if session exists
- `(protected)/layout.tsx` — redirects to `/login` if no session
- Individual pages do NOT need to re-check session (layout handles it)

---

## Database

### Schema — `src/db/schema.ts`

- All tables defined in one file
- Use `pgTable` from `drizzle-orm/pg-core`
- Use `nanoid` for ID generation: `.$defaultFn(() => nanoid())`
- Always define relations with `relations()`
- Use `timestamp` with `.defaultNow()` and `.$onUpdate(() => new Date())`

### Instance — `src/db/index.ts`

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(client);
```

### Drizzle Config — `drizzle.config.ts`

```typescript
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL as string },
});
```

---

## Data Fetching (Client)

### Eden Treaty Client — `src/lib/eden.ts`

```typescript
import { treaty } from "@elysiajs/eden";
import type { app } from "@/app/api/[[...slugs]]/route";

export const api = treaty<typeof app>(
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
).api;
```

- `typeof app` gives full type safety from Elysia routes
- Only import `app` as a **type** (no server code in browser bundle)

### React Query — `src/lib/query-client.ts`

- Uses `superjson` for serialization (dehydrate/hydrate)
- `staleTime: 10 * 60 * 1000` (10 minutes)
- `retry: 1`
- Singleton pattern: one `QueryClient` on browser, new instance per request on server

### Usage in Components

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsQueryKey } from "../_server/type";
import { fetchPosts, createPost } from "../_server";

// Query
const { data, isLoading, isError, error } = useQuery({
  queryKey: postsQueryKey,
  queryFn: fetchPosts,
});

// Mutation
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: postsQueryKey });
    toast.success("Created.");
  },
  onError: (err: Error) => toast.error(err.message),
});
```

---

## Forms

Use **React Hook Form** + **Zod** + **shadcn Field** components:

```typescript
"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postBodySchema, type PostBodyInput } from "../_server/type";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const { handleSubmit, reset, control } = useForm<PostBodyInput>({
  resolver: zodResolver(postBodySchema),
  defaultValues: { name: "", content: "" },
});

// In JSX:
<Controller
  name="name"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="name">Title</FieldLabel>
      <Input {...field} id="name" aria-invalid={fieldState.invalid} />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

---

## UI & Styling

### Rules

- **Always use CSS variables** from `globals.css` — never use hardcoded colors like `bg-white`, `text-gray-700`
- Use `bg-card`, `text-card-foreground`, `bg-background`, `text-muted-foreground`, etc.
- Use `cn()` from `@/lib/utils` for conditional class merging
- Use shadcn components from `@/components/ui/`

### Adding Components

```bash
pnpm dlx shadcn@latest add button
```

### Toast Notifications

```typescript
import { toast } from "sonner";
toast.success("Done.");
toast.error("Something went wrong.");
```

Configured globally in `src/components/sonner-provider.tsx`.

---

## Code Style (Biome)

### Rules

- **Formatter**: 2-space indent, double quotes
- **Imports**: auto-organized (external → internal → relative)
- **Type imports**: use `import type` for type-only imports
- **No `any`**: use `unknown` and narrow with type guards
- **No non-null assertions** (`!`): use optional chaining (`?.`) instead
- **No hardcoded colors**: use Tailwind CSS variables

### Key Biome Config

```json
{
  "suspicious": {
    "noUnknownAtRules": "off",
    "noExplicitAny": "warn",
    "noArrayIndexKey": "warn"
  },
  "a11y": {
    "useSemanticElements": "off",
    "useKeyWithClickEvents": "off"
  }
}
```

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Files (components) | kebab-case | `post-form.tsx` |
| Files (utilities) | kebab-case | `query-client.ts` |
| Components | PascalCase | `PostsPageClient`, `PostForm` |
| Functions | camelCase | `fetchPosts`, `createPost` |
| Constants | camelCase | `postsQueryKey` |
| Types/Interfaces | PascalCase | `Post`, `PostBodyInput` |
| DB Tables | camelCase (Drizzle) | `posts`, `user` |
| DB Columns | camelCase | `userId`, `createdAt` |

---

## Error Handling

### Utility — `extractErrorMessage`

```typescript
import { extractErrorMessage } from "@/lib/utils";

// In data fetching functions:
if (error) {
  throw new Error(extractErrorMessage("Failed to fetch posts", error));
}
```

### In Components

```typescript
// React Query error handling
onError: (err: Error) => toast.error(err.message);

// Display
{isError && <p className="text-sm text-destructive">{error?.message}</p>}
```

---

## Environment Variables

```bash
DATABASE_URL=           # PostgreSQL connection string (URL-encode special chars!)
BETTER_AUTH_SECRET=     # Random secret for Better Auth
BETTER_AUTH_URL=        # App base URL (e.g., http://localhost:3000)
NEXT_PUBLIC_BASE_URL=   # Same as BETTER_AUTH_URL (client-accessible)
```

**Important**: URL-encode special characters in DATABASE_URL passwords:
- `!` → `%21`, `@` → `%40`, `#` → `%23`

---

## Validation Checklist

Before committing, always run:

```bash
pnpm build    # Must pass (TypeScript + Next.js build)
pnpm lint     # Must pass (Biome check)
```
