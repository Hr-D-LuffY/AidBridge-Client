'use client'

import { SearchX } from 'lucide-react'
import Link from 'next/link'
import { ErrorScreen } from '@/components/shared/error-screen'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AreaViewProps = {
  // The area's overview, so the user can always get back to a page that works.
  homeHref: string
}

// The error boundary view of a signed-in area. It renders inside the area's layout, so the sidebar
// and top bar stay and the user can navigate away. `retry` re-fetches the page's data.
export function AreaError({ homeHref, retry }: AreaViewProps & { retry: () => void }) {
  return (
    <ErrorScreen
      title="Something went wrong"
      actions={
        <>
          <Button className="h-11 px-5" onClick={() => retry()}>
            Try again
          </Button>
          <Link href={homeHref} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5')}>
            Back to overview
          </Link>
        </>
      }
    >
      <p>We could not load this page. Check your connection and try again.</p>
    </ErrorScreen>
  )
}

// Shown when a page in the area calls notFound(): a record that does not exist, or one that belongs
// to someone else (the backend answers 404 for both), and any address the area has no page for.
export function AreaNotFound({ homeHref }: AreaViewProps) {
  return (
    <ErrorScreen
      icon={SearchX}
      title="Page not found"
      actions={
        <Link href={homeHref} className={cn(buttonVariants({ variant: 'outline' }), 'h-11 px-5')}>
          Back to overview
        </Link>
      }
    >
      <p>We could not find that. It may not exist, or it may belong to someone else.</p>
    </ErrorScreen>
  )
}
