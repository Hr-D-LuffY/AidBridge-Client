'use client'

import { Loader2, Siren } from 'lucide-react'
import { useId, useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { EmptyState } from '@/components/shared/empty-state'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { PriorityBadge, StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { SOS_SEARCH_MIN_LENGTH } from '@/features/sos/sos.params'
import { useSosListQuery } from '@/features/sos/sos.queries'
import { useDebounce } from '@/hooks/use-debounce'
import { getErrorMessage } from '@/lib/api/errors'
import { MAX_SOS_LINKS_PER_CALL } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/format'
import { SosLinkAction } from '@/types'
import { useLinkRequests } from '../incident.queries'

// How many requests the picker shows at a time.
const PICKER_PAGE_SIZE = 20

type LinkRequestsSheetProps = {
  incidentId: string
  // The requests already linked to the incident. They are shown as linked and cannot be picked again.
  linkedIds: readonly string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Picks requests to link to an incident, so its page can count how many of them were rescued. The backend
// takes up to 50 at once and ignores one that is already linked. Mount it only while it is open.
export function LinkRequestsSheet({
  incidentId,
  linkedIds,
  open,
  onOpenChange,
}: LinkRequestsSheetProps) {
  const searchId = useId()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const q = useDebounce(search.trim())
  const query = useSosListQuery({
    q: q.length >= SOS_SEARCH_MIN_LENGTH ? q : undefined,
    page,
    limit: PICKER_PAGE_SIZE,
  })
  const link = useLinkRequests(incidentId)
  // Kept while searching and paging, so one link call can take requests from several pages.
  const [picked, setPicked] = useState<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const linked = new Set(linkedIds)
  const full = picked.length >= MAX_SOS_LINKS_PER_CALL

  function toggle(id: string) {
    setPicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  function submit() {
    setServerError(null)
    link.mutate(
      { action: SosLinkAction.LINK, ids: picked },
      {
        onSuccess: () => onOpenChange(false),
        onError: (error) => setServerError(getErrorMessage(error)),
      },
    )
  }

  let body: React.ReactNode
  if (query.isPending) {
    body = (
      <div className="flex flex-col gap-3 p-4">
        {['one', 'two', 'three', 'four'].map((id) => (
          <Skeleton key={id} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  } else if (query.isError) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.data.items.length === 0) {
    body = (
      <EmptyState
        bare
        icon={Siren}
        title={q ? 'No requests match' : 'No requests yet'}
        description={
          q
            ? 'Search matches whole words of the address and details. Try another word.'
            : 'When victims raise requests, you can link them to an incident here.'
        }
      />
    )
  } else {
    body = (
      <ul aria-label="Requests" className="flex flex-col gap-2 p-4">
        {query.data.items.map((sos) => {
          const isLinked = linked.has(sos.id)
          const isPicked = picked.includes(sos.id)
          const id = `link-${sos.id}`
          return (
            <li key={sos.id}>
              <label
                htmlFor={id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-input p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-sidebar-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={isLinked || isPicked}
                  disabled={isLinked || (full && !isPicked)}
                  onChange={() => toggle(sos.id)}
                  className="mt-1 size-5 shrink-0 cursor-pointer accent-primary"
                />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className="font-medium text-balance">
                    {sos.address || `Request from ${sos.victim.name}`}
                  </span>
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge kind="sos" status={sos.status} />
                    <PriorityBadge priority={sos.priority} />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {sos.victim.name} · {formatRelativeTime(sos.createdAt)}
                    {isLinked && ' · already linked'}
                  </span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Link requests</SheetTitle>
          <SheetDescription>
            Choose the requests this disaster caused, newest first. You can link up to{' '}
            {MAX_SOS_LINKS_PER_CALL} at a time.
          </SheetDescription>
          <div className="flex flex-col gap-1.5 pt-2">
            <label htmlFor={searchId} className="text-sm font-medium">
              Search
            </label>
            <Input
              id={searchId}
              type="search"
              value={search}
              placeholder="Words in the address or details"
              className="h-11 text-base md:text-sm"
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
        </SheetHeader>

        {body}

        {query.data && (
          <PaginationBar
            meta={{ ...query.data.meta, limit: PICKER_PAGE_SIZE }}
            onPageChange={setPage}
            disabled={query.isFetching}
            className="px-4 pb-4"
          />
        )}

        <div className="sticky bottom-0 flex flex-col gap-3 border-t bg-background p-4">
          <FormError message={serverError} />
          <Button
            type="button"
            className="h-12 w-full rounded-xl text-base font-semibold"
            disabled={picked.length === 0 || link.isPending}
            onClick={submit}
          >
            {link.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {picked.length === 0
              ? 'Pick requests to link'
              : `Link ${picked.length} ${picked.length === 1 ? 'request' : 'requests'}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
