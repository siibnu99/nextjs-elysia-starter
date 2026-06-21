"use client"

import { PageHeader } from "@/components/page-header"
import { ScopesDataTable } from "./scopes-data-table"

export function ScopesPageClient() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scopes"
        description="View available scopes and scope items"
      />
      <ScopesDataTable />
    </div>
  )
}
