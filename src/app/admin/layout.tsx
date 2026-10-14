import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AreaShell } from '@/components/layout/area-shell'
import { requireRole } from '@/lib/auth/require-role'
import { SessionProvider } from '@/providers/session-provider'
import { Role } from '@/types/enums'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false },
}

// Admin area. The live profile (GET /auth/me) is checked on the server, so a wrong role never
// renders; the same profile is shared with every client component below through SessionProvider.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(Role.ADMIN)
  return (
    <SessionProvider session={profile}>
      <AreaShell>{children}</AreaShell>
    </SessionProvider>
  )
}
