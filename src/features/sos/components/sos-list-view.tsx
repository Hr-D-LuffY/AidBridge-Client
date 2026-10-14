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
import {
  countActiveFilters,
  parseSosViewParams,
  SOS_FETCH_PARAMS,
  SOS_PAGE_SIZE,
} from '../sos.params'
import { useSosListQuery } from '../sos.queries'
import { applySosView } from '../sos.view'
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

// "My requests": one card per request, with search, sort and filters. The whole list is fetched once
// and everything the user chooses lives in the URL; the server page has already put it in the cache.
export function SosListView() {
  const params = useQueryParams()
  const view = parseSosViewParams({
    page: params.get('page'),
    status: params.get('status'),
    priority: params.get('priority'),
    need: params.get('need'),
    q: params.get('q'),
    sort: params.get('sort'),
  })
  const query = useSosListQuery(SOS_FETCH_PARAMS)

  const requests = query.data?.items ?? []
  const result = applySosView(requests, view)
  const filtered = countActiveFilters(view) > 0
  const truncated = (query.data?.meta.total ?? 0) > requests.length

  let body: React.ReactNode
  if (query.isPending) {
    body = <CardsSkeleton />
  } else if (query.isError) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (requests.length === 0) {
    body = (
      <EmptyState
        icon={ClipboardList}
        title="You have not raised a request yet"
        description="When you need rescue or relief, raise an SOS. It takes a minute, and volunteers nearby see it at once."
        action={<RaiseLink />}
      />
    )
  } else if (result.total === 0) {
    body = (
      <EmptyState
        icon={SearchX}
        title="No requests match"
        description="Try a different search, or clear the filters."
        action={
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            onClick={() => params.clear('status', 'priority', 'need', 'q')}
          >
            Clear all filters
          </Button>
        }
      />
    )
  } else {
    body = (
      <>
        <ul aria-label="Your SOS requests" className="flex flex-col gap-4">
          {result.items.map((sos) => (
            <li key={sos.id}>
              <SosCard sos={sos} />
            </li>
          ))}
        </ul>
        <PaginationBar
          meta={{ page: result.page, limit: SOS_PAGE_SIZE, total: result.total }}
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
        {requests.length > 0 && <SosToolbar view={view} params={params} />}

        {requests.length > 0 && (
          <p aria-live="polite" className="text-sm text-muted-foreground">
            {filtered
              ? `${result.total} of ${requests.length} requests match`
              : `${requests.length} ${requests.length === 1 ? 'request' : 'requests'}`}
            {truncated && ' (your 100 newest)'}
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
        <Skeleton key={id} className="h-64 rounded-2xl" />
      ))}
    </div>
  )
}
