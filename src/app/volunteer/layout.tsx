import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AreaShell } from '@/components/layout/area-shell'
import { requireRole } from '@/lib/auth/require-role'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'

export const metadata: Metadata = {
  title: 'Volunteer',
  robots: { index: false },
}

// Volunteer area. The live profile (GET /auth/me) is checked on the server, so a wrong role never
// renders; the same profile is shared with every client component below through SessionProvider.
export default async function VolunteerLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(Role.VOLUNTEER)
  return (
    <SessionProvider session={profile}>
      <AreaShell>{children}</AreaShell>
    </SessionProvider>
  )
}
