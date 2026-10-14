import { SearchX } from 'lucide-react'
import type { Metadata } from 'next'
import { ErrorScreen, HomeLink } from '@/components/shared/error-screen'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <main id="main-content">
      <ErrorScreen icon={SearchX} title="Page not found" actions={<HomeLink />}>
        <p>The page you are looking for does not exist, or it has moved.</p>
      </ErrorScreen>
    </main>
  )
}
