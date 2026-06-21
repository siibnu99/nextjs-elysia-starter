import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
        <h2 className="text-sm font-medium text-muted-foreground">Summary</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This is a simple dashboard page. You can extend it with statistics,
          charts, and more as needed.
        </p>
      </div>
    </div>
  )
}
