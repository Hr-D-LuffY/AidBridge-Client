import { OverviewPlaceholder } from '@/components/layout/overview-placeholder'
import { requireRole } from '@/lib/auth/require-role'
import { Role } from '@/types/enums'

export default async function AdminOverviewPage() {
  const profile = await requireRole(Role.ADMIN)
  return <OverviewPlaceholder name={profile.name} role={profile.role} />
}
