# NextJS + Elysia Starter

A full-stack starter kit combining **Next.js App Router** with **Elysia** as the API layer, featuring authentication, type-safe client-server communication, and a modern UI.

## Tech Stack

- **Next.js 16** — App Router with server components
- **Elysia 1.4** — Lightweight HTTP framework under `/api`
- **Better Auth** — Email/password authentication
- **Drizzle ORM** — PostgreSQL (Neon) with type-safe queries
- **TanStack React Query** — Data fetching with superjson serialization
- **shadcn/ui** — Radix-based UI components (radix-nova style)
- **Tailwind CSS v4** — Utility-first CSS with CSS variables
- **Zod** — End-to-end validation
- **Biome** — Linting and formatting
- **pnpm** — Package manager

## Features

- **Authentication** — Email/password via Better Auth, session-based with route group guards
- **Route Groups** — `(public)`, `(auth)`, `(protected)` with automatic redirects
- **Type-Safe API** — Elysia routers + Eden treaty client for full-stack type safety
- **CRUD Example** — Posts module with create, read, update, delete
- **Blog** — Public blog listing reusing the posts API
- **Dark Mode Ready** — CSS variables, no hardcoded colors

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env` file:

```bash
DATABASE_URL=           # PostgreSQL connection string
BETTER_AUTH_SECRET=     # Random secret (generate with: openssl rand -hex 32)
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Note**: URL-encode special characters in DATABASE_URL passwords (`!` → `%21`, `@` → `%40`, `#` → `%23`)

### 3. Run database migrations

```bash
pnpm drizzle-kit push
```

### 4. Start development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build (validates TypeScript + Next.js) |
| `pnpm start` | Start production server |
| `pnpm lint` | Check with Biome |
| `pnpm format` | Format with Biome |
| `pnpm drizzle-kit push` | Push schema to database |
| `pnpm drizzle-kit generate` | Generate migrations |
| `pnpm drizzle-kit studio` | Open Drizzle Studio |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, providers, toaster)
│   ├── globals.css             # Tailwind + shadcn theme
│   ├── (public)/               # Public pages (/ , /blog)
│   ├── (auth)/                 # Auth pages (/login, /register)
│   ├── (protected)/            # Protected pages (/dashboard, /settings)
│   └── api/
│       ├── [[...slugs]]/route.ts   # Elysia catch-all
│       └── auth/[...all]/route.ts  # Better Auth handler
├── components/
│   └── ui/                     # shadcn/ui components
├── db/
│   ├── index.ts                # Drizzle instance
│   └── schema.ts               # Table definitions + relations
├── lib/
│   ├── auth.ts                 # Better Auth server
│   ├── auth-client.ts          # Better Auth React client
│   ├── eden.ts                 # Eden treaty client
│   ├── query-client.ts         # React Query factory
│   └── utils.ts                # cn(), extractErrorMessage()
└── server/
    └── protected-route.ts      # authPlugin (Elysia auth macro)
```

## Feature Module Pattern

Each feature follows this colocation structure:

```
feature/
├── page.tsx            # Next.js page (thin wrapper)
├── _server/
│   ├── route.ts        # Elysia router
│   ├── type.ts         # Zod schemas, types, query keys
│   └── index.ts        # Client data fetching (uses Eden)
└── _components/
    ├── feature-page.tsx
    └── feature-form.tsx
```

## API Endpoints

### Posts (protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | List all posts |
| `GET` | `/api/posts/:id` | Get single post |
| `POST` | `/api/posts` | Create post (auth required) |
| `PATCH` | `/api/posts/:id` | Update own post (auth required) |
| `DELETE` | `/api/posts/:id` | Delete own post (auth required) |

### Blog (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blog` | List all blog posts |

## Routing Rules

| Route Group | Behavior |
|-------------|----------|
| `(public)` | No auth required |
| `(auth)` | Redirects to `/dashboard` if session exists |
| `(protected)` | Redirects to `/login` if no session |

## License

MIT
