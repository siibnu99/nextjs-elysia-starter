import { headers } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className={buttonVariants({ variant: "secondary" })}>
              Back to Home
            </Link>
            <Link href="/dashboard/post" className={buttonVariants()}>
              Post
            </Link>
            <Link href="/settings" className={buttonVariants()}>
              Settings
            </Link>
            <LogoutButton />
          </div>
        </header>

        <main className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-sm font-medium text-muted-foreground">
              Account information
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p>
                <span className="font-medium">Email:</span> {user?.email ?? "-"}
              </p>
              <p>
                <span className="font-medium">Name:</span> {user?.name ?? "-"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
            <h2 className="text-sm font-medium text-muted-foreground">
              Summary
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This is a simple dashboard page. You can extend it with
              statistics, charts, and more as needed.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
