'use client'

import { ArrowRight, Bell, BellOff, CheckCheck } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PageHeader } from '@/components/shared/page-header'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParams } from '@/hooks/use-query-params'
import { useSession } from '@/hooks/use-session'
import { NOTIFICATION_PAGE_SIZE } from '@/lib/constants'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types'
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationsQuery,
  useUnreadCountQuery,
} from '../notification.queries'
import {
  CATEGORY_LABEL,
  getNotificationLink,
  getNotificationStyle,
  groupByCategory,
  TONE_CLASSES,
} from '../notification.view'
import { useNotificationPolling } from '../use-notification-polling'

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
  const link = getNotificationLink(role, notification)
  const { icon: Icon, tone } = getNotificationStyle(notification.type)
  return (
    <li
      className={cn(
        'flex gap-3 rounded-2xl border p-4 sm:gap-4 sm:p-5',
        isEmergencyBroadcast && !isRead && 'border-destructive/40 bg-destructive-soft',
        isRead ? 'bg-card' : !isEmergencyBroadcast && 'border-primary/30 bg-sidebar-accent',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('grid size-10 shrink-0 place-items-center rounded-full', TONE_CLASSES[tone])}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {isEmergencyBroadcast && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
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
        <h3 className="text-base font-semibold text-balance">{title}</h3>
        <p className="wrap-anywhere text-sm text-pretty whitespace-pre-line">{message}</p>
        {(link || !isRead) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            {link && (
              <Link
                href={link.href}
                // Opening what it is about is reading it.
                onClick={() => !isRead && onRead(notification)}
                className={cn(buttonVariants(), 'h-10 gap-2 px-4')}
              >
                {link.label}
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
      </div>
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
// backend decides what each one is shown). Each page is split into groups by category (requests, tasks,
// safety, camps, announcements); the page and the filter live in the URL. It looks for new ones every
// 15 seconds (volunteers) or 30 while the tab is visible.
export function NotificationsView() {
  const params = useQueryParams()
  const filter: Filter | undefined = params.getOneOf('filter', ['unread'])
  const page = params.getPage()
  const poll = useNotificationPolling()

  const query = useNotificationsQuery(
    { page, limit: NOTIFICATION_PAGE_SIZE, unread: filter === 'unread' ? true : undefined },
    poll,
  )
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllRead()
  // The same cached number the bell shows. Nothing to do when it is 0.
  const unread = useUnreadCountQuery(false).data ?? 0

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
        <div className="flex flex-col gap-6">
          {groupByCategory(query.data.items).map((group) => (
            <section key={group.category} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                {CATEGORY_LABEL[group.category]}
              </h2>
              <ul className="flex flex-col gap-3">
                {group.items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    disabled={markRead.isPending && markRead.variables?.id === notification.id}
                    onRead={(item) => markRead.mutate(item)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
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
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 px-4"
            disabled={unread === 0 || markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck aria-hidden="true" />
            Mark all as read
          </Button>
        }
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
