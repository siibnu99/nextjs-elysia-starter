import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center">
        <section className="flex-1 space-y-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary/70 uppercase">
            NextJS &amp; Elysia Starter
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            A simple starter kit
            <br />
            for building modern apps.
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Comes with Better Auth, React Query, and shadcn-style UI out of the
            box so you can focus on features instead of setup.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Already have an account?</Link>
            </Button>
          </div>

          <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3 sm:text-sm">
            <div className="rounded-lg border bg-card/40 px-3 py-2">
              <p className="font-medium text-foreground">Auth ready to use</p>
              <p>
                Login, register, and route protection powered by Better Auth.
              </p>
            </div>
            <div className="rounded-lg border bg-card/40 px-3 py-2">
              <p className="font-medium text-foreground">Modern UI</p>
              <p>Clean shadcn-inspired colors and components.</p>
            </div>
            <div className="rounded-lg border bg-card/40 px-3 py-2">
              <p className="font-medium text-foreground">Ready to scale</p>
              <p>Elysia &amp; Drizzle integration for a lightweight backend.</p>
            </div>
          </div>
        </section>

        <aside className="mt-6 flex flex-1 justify-center md:mt-0">
          <div className="relative w-full max-w-sm rounded-2xl border bg-card p-6 text-card-foreground shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                <p className="text-sm font-semibold">Dashboard</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Demo
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <span className="text-muted-foreground">Session status</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                  Active
                </span>
              </div>
              <div className="rounded-lg border bg-background px-3 py-2">
                <p className="text-[11px] font-medium text-muted-foreground">
                  Tips
                </p>
                <p className="mt-1 text-[11px]">
                  Edit the dashboard &amp; settings pages to match your
                  project&apos;s needs.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/blog">Blog</Link>
              </Button>
              {session?.user && (
                <Button asChild size="sm">
                  <Link href="/dashboard">Open dashboard</Link>
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
