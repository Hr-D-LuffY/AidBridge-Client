import { OverviewPlaceholder } from '@/components/layout/overview-placeholder'
import { requireRole } from '@/lib/auth/require-role'
import { Role } from '@/types/enums'

export default async function NgoOverviewPage() {
  const profile = await requireRole(Role.NGO)
  return <OverviewPlaceholder name={profile.name} role={profile.role} />
}
