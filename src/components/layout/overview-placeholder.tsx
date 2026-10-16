import { LayoutDashboard } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { ROLE_LABEL } from '@/lib/constants'
import type { Role } from '@/types/enums'

// Stands in for an area's overview until the part that builds it replaces the page (admin: part 9). It
// keeps the sign-in landing from being a 404.
export function OverviewPlaceholder({ name, role }: { name: string; role: Role }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome, ${name}`}
        description={`You are signed in as ${ROLE_LABEL[role]}.`}
      />
      <EmptyState
        icon={LayoutDashboard}
        title="Your overview is not ready yet"
        description="The pages for your role are being added one by one. Use the menu to see what is available."
      />
    </div>
  )
}
