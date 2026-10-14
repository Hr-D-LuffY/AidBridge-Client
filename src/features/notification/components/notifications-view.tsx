'use client'

import { ArrowRight, Bell, BellOff, CheckCheck, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/hooks/use-polling'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { NOTIFICATION_PAGE_SIZE, POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types'
import { useMarkNotificationRead, useNotificationsQuery } from '../notification.queries'
import { getNotificationHref } from '../notification.view'

const FILTER_OPTIONS = [{ value: 'unread', label: 'Unread' }] as const
type Filter = (typeof FILTER_OPTIONS)[number]['value']

function NotificationItem({
  notification,
  onRead,
  disabled,
}: {
  notification: AppNotification
  onRead: (notification: AppNotification) => void
  disabled: boolean
}) {
  const { role } = useSession()
  const { title, message, isRead, isEmergencyBroadcast, createdAt } = notification
  const href = getNotificationHref(role, notification.sosRequestId)
  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-2xl border p-4 sm:p-5',
        isEmergencyBroadcast && !isRead && 'border-destructive/40 bg-destructive-soft',
        isRead ? 'bg-card' : !isEmergencyBroadcast && 'border-primary/30 bg-sidebar-accent',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {isEmergencyBroadcast && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
            <Megaphone aria-hidden="true" className="size-3.5" />
            Emergency alert
          </span>
        )}
        {!isRead && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-link">
            <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
            New
          </span>
        )}
        <time
          dateTime={createdAt}
          title={formatDateTime(createdAt)}
          className="text-xs text-muted-foreground"
        >
          {formatRelativeTime(createdAt)}
        </time>
      </div>
      <h2 className="text-base font-semibold text-balance">{title}</h2>
      <p className="text-sm text-pretty whitespace-pre-line">{message}</p>
      {(href || !isRead) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          {href && (
            <Link
              href={href}
              // Opening the conversation is reading it.
              onClick={() => !isRead && onRead(notification)}
              className={cn(buttonVariants(), 'h-10 gap-2 px-4')}
            >
              Open the conversation
              <ArrowRight aria-hidden="true" />
            </Link>
          )}
          {!isRead && (
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 px-4"
              disabled={disabled}
              onClick={() => onRead(notification)}
            >
              <CheckCheck aria-hidden="true" />
              Mark as read
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {['one', 'two', 'three'].map((id) => (
        <Skeleton key={id} className="h-28 rounded-2xl" />
      ))}
    </div>
  )
}

// Alerts and updates for the signed-in user, newest first, the same page for all four roles (the
// backend decides what each one is shown). The page and the filter live in the URL. It looks for new
// ones every 30 seconds while the tab is visible.
export function NotificationsView() {
  const params = useQueryParams()
  const filter: Filter | undefined = params.getOneOf('filter', ['unread'])
  const page = params.getPage()
  const poll = usePolling(POLL_INTERVAL_MS.notifications)

  const query = useNotificationsQuery(
    { page, limit: NOTIFICATION_PAGE_SIZE, unread: filter === 'unread' ? true : undefined },
    poll,
  )
  const markRead = useMarkNotificationRead()

  let body: React.ReactNode
  if (query.isPending) {
    body = <ListSkeleton />
  } else if (query.isError && !query.data) {
    body = <ListErrorState onRetry={() => query.refetch()} />
  } else if (query.data && query.data.items.length === 0) {
    body = filter ? (
      <EmptyState
        icon={BellOff}
        title="Nothing unread"
        description="You have read everything addressed to you."
        action={
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4"
            onClick={() => params.clear('filter')}
          >
            Show all
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="Alerts from administrators and updates about your requests will appear here."
      />
    )
  } else if (query.data) {
    body = (
      <>
        <ul className="flex flex-col gap-3">
          {query.data.items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              disabled={markRead.isPending && markRead.variables?.id === notification.id}
              onRead={(item) => markRead.mutate(item)}
            />
          ))}
        </ul>
        <PaginationBar
          meta={query.data.meta}
          onPageChange={params.setPage}
          disabled={query.isPlaceholderData}
        />
      </>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Alerts from administrators and updates about your requests."
      />
      <FilterChips
        label="Show"
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(value) => params.set({ filter: value })}
        allLabel="All"
      />
      {body}
    </div>
  )
}
