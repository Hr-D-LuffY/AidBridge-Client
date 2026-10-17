'use client'

import { ClipboardList, SearchX, Siren } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParams } from '@/hooks/use-query-params'
import { cn } from '@/lib/utils'
import { countActiveFilters, parseSosParams, SOS_PAGE_SIZE, toSosQuery } from '../sos.params'
import { useSosListQuery } from '../sos.queries'
import { SosCard } from './sos-card'
import { SosToolbar } from './sos-toolbar'

function RaiseLink() {
  return (
    <Link
      href="/dashboard/sos/new"
      className={cn(buttonVariants(), 'h-11 gap-2 bg-cta px-5 text-cta-foreground hover:bg-cta/90')}
    >
      <Siren aria-hidden="true" />
      Raise SOS
    </Link>
  )
}

// "My requests": one card per request, with search, sort and filters. The server filters, sorts and pages
// the list; everything the user chooses lives in the URL, and the server page has already put the first
// answer in the cache.
export function SosListView() {
  const params = useQueryParams()
  const view = parseSosParams({
    page: params.get('page'),
    status: params.get('status'),
    priority: params.get('priority'),
    needs: params.get('needs'),
    q: params.get('q'),
    from: params.get('from'),
    to: params.get('to'),
    sort: params.get('sort'),
  })
  const query = useSosListQuery(toSosQuery(view, SOS_PAGE_SIZE))

  const filtered = countActiveFilters(view) > 0
  const total = query.data?.meta.total
  const clearFilters = () => params.clear('status', 'priority', 'needs', 'q', 'from', 'to')

  let body: React.ReactNode
  if (query.isPending) {
    body = <CardsSkeleton />
  } else if (query.isError) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.data.items.length === 0 && !filtered) {
    body = (
      <EmptyState
        icon={ClipboardList}
        title="You have not raised a request yet"
        description="When you need rescue or relief, raise an SOS. It takes a minute, and volunteers nearby see it at once."
        action={<RaiseLink />}
      />
    )
  } else if (query.data.items.length === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title="No requests match"
        description="Try a different search, or clear the filters."
        action={
          <Button type="button" variant="outline" className="h-10 px-4" onClick={clearFilters}>
            Clear all filters
          </Button>
        }
      />
    )
  } else {
    body = (
      <>
        <ul aria-label="Your SOS requests" className="flex flex-col gap-4">
          {query.data.items.map((sos) => (
            <li key={sos.id}>
              <SosCard sos={sos} />
            </li>
          ))}
        </ul>
        <PaginationBar
          meta={{ ...query.data.meta, limit: SOS_PAGE_SIZE }}
          onPageChange={params.setPage}
          disabled={query.isFetching}
        />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My requests"
        description="Every SOS you have raised, and where each one stands."
        actions={<RaiseLink />}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {query.data && (total !== 0 || filtered) && <SosToolbar view={view} params={params} />}

        {total !== undefined && (total !== 0 || filtered) && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {filtered
              ? `${total} ${total === 1 ? 'request matches' : 'requests match'}`
              : `${total} ${total === 1 ? 'request' : 'requests'}`}
          </p>
        )}

        {body}
      </div>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <output className="sr-only">Loading your requests</output>
      {['one', 'two', 'three'].map((id) => (
        <Skeleton key={id} className="h-28 rounded-2xl" />
      ))}
    </div>
  )
}
