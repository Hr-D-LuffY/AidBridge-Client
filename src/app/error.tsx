'use client'

import { ErrorScreen, HomeLink } from '@/components/shared/error-screen'
import { Button } from '@/components/ui/button'

// Route error boundary. In this Next version `retry()` re-renders the segment and refetches its
// data, which is what "Try again" should do; `reset()` only clears the error state.
export default function RootError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main id="main-content">
      <ErrorScreen
        title="Something went wrong"
        actions={
          <>
            <Button className="h-11 px-5" onClick={() => retry()}>
              Try again
            </Button>
            <HomeLink />
          </>
        }
      >
        <p>We could not load this page. Check your connection and try again.</p>
      </ErrorScreen>
    </main>
  )
}
