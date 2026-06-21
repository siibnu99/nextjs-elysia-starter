import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function Settings() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <h2 className="text-sm font-medium text-muted-foreground">Profil</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This is currently just a placeholder. You can add a profile update form
          here later.
        </p>
        <div className="mt-3 space-y-1 text-sm">
          <p>
            <span className="font-medium">Email:</span> {user?.email ?? "-"}
          </p>
          <p>
            <span className="font-medium">Name:</span> {user?.name ?? "-"}
          </p>
        </div>
      </div>
    </div>
  )
}
