'use client'

import { ArrowRight, Ban, Plus, ShieldCheck, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { FilterChips } from '@/components/shared/filter-chips'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { useQueryParams } from '@/hooks/use-query-params'
import { ADMIN_PAGE_SIZE, RATING_MAX, ROLE_LABEL } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Role, type UserProfile } from '@/types'
import { parseUsersParams, toUsersQuery } from '../user.params'
import { useUsersQuery } from '../user.queries'
import { BlockAccountDialog, UnblockAccountDialog } from './block-dialogs'

const BLOCKED_OPTIONS = [{ value: 'blocked', label: 'Blocked' }] as const

const ROLE_OPTIONS = Object.values(Role).map((role) => ({ value: role, label: ROLE_LABEL[role] }))

// The columns, with the two row actions handed in: blocking a scammer should be one click from the list,
// not a trip into their page. An admin account has no button, because the backend will not block one.
function buildColumns(
  onBlock: (user: UserProfile) => void,
  onUnblock: (user: UserProfile) => void,
): DataTableColumn<UserProfile>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      primary: true,
      cell: (user) => (
        <div className="flex flex-col items-start gap-1">
          <Link
            href={`/admin/users/${user.id}`}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md font-semibold text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:min-h-11"
          >
            {user.name}
            <ArrowRight aria-hidden="true" className="size-4" />
            <span className="sr-only"> (open account)</span>
          </Link>
          {user.isBlocked && (
            <Badge variant="secondary" className="h-6 bg-destructive-soft px-2.5 text-destructive">
              <Ban aria-hidden="true" />
              Blocked
            </Badge>
          )}
        </div>
      ),
    },
    { id: 'role', header: 'Role', cell: (user) => <StatusBadge kind="role" status={user.role} /> },
    {
      id: 'contact',
      header: 'Contact',
      cell: (user) => (
        <div className="flex flex-col items-start md:items-start">
          <span className="break-all">{user.email}</span>
          <span className="text-sm text-muted-foreground">{user.phone || 'No phone number'}</span>
        </div>
      ),
    },
    {
      id: 'volunteer',
      header: 'Volunteer',
      cell: (user) =>
        user.role === Role.VOLUNTEER ? (
          <div className="flex flex-col items-start gap-0.5">
            <span>{user.isAvailable ? 'Available' : 'Not available'}</span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star aria-hidden="true" className="size-3.5" />
              {user.totalRatings > 0
                ? `${user.reliabilityScore.toFixed(1)} / ${RATING_MAX} (${user.totalRatings})`
                : 'Not rated yet'}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">–</span>
        ),
    },
    {
      id: 'joined',
      header: 'Joined',
      cell: (user) => <span className="whitespace-nowrap">{formatDate(user.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      actions: true,
      align: 'right',
      cell: (user) => {
        if (user.role === Role.ADMIN)
          return <span className="text-sm text-muted-foreground">–</span>
        return user.isBlocked ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5 px-3"
            onClick={() => onUnblock(user)}
          >
            <ShieldCheck aria-hidden="true" />
            Unblock
            <span className="sr-only"> {user.name}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-1.5 px-3 text-destructive hover:text-destructive"
            onClick={() => onBlock(user)}
          >
            <Ban aria-hidden="true" />
            Block
            <span className="sr-only"> {user.name}</span>
          </Button>
        )
      },
    },
  ]
}

// Every account on the platform, filtered by role. The role and page live in the URL. NGO and admin
// accounts only exist because an admin made them here; volunteers come from approved requests.
export function UsersView() {
  const params = useQueryParams()
  const view = parseUsersParams({
    page: params.get('page'),
    role: params.get('role'),
    blocked: params.get('blocked'),
  })
  const query = useUsersQuery(toUsersQuery(view))
  const [toBlock, setToBlock] = useState<UserProfile | null>(null)
  const [toUnblock, setToUnblock] = useState<UserProfile | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Everyone with an account. NGO and admin accounts are made here; volunteers come from approved requests."
        actions={
          <Link href="/admin/users/new" className={cn(buttonVariants(), 'h-11 gap-2 px-5')}>
            <Plus aria-hidden="true" />
            Add NGO or admin
          </Link>
        }
      />

      <FilterChips
        label="Role"
        options={ROLE_OPTIONS}
        value={view.role}
        onChange={(role) => params.set({ role })}
      />
      <FilterChips
        label="Account"
        allLabel="All accounts"
        options={BLOCKED_OPTIONS}
        value={view.blocked ? 'blocked' : undefined}
        onChange={(blocked) => params.set({ blocked: blocked ? '1' : undefined })}
      />

      <DataTable
        label="Users"
        columns={buildColumns(setToBlock, setToUnblock)}
        rows={query.data?.items}
        getRowId={(user) => user.id}
        isLoading={query.isPending}
        isFetching={query.isFetching}
        isError={query.isError}
        onRetry={() => query.refetch()}
        skeletonRows={ADMIN_PAGE_SIZE}
        pagination={
          query.data && {
            meta: { ...query.data.meta, limit: ADMIN_PAGE_SIZE },
            onPageChange: params.setPage,
          }
        }
        empty={
          <EmptyState
            icon={Users}
            title="No accounts here"
            description={
              view.blocked
                ? 'No account with these filters is blocked.'
                : 'No account has this role yet.'
            }
          />
        }
      />

      {toBlock && <BlockAccountDialog user={toBlock} onClose={() => setToBlock(null)} />}
      {toUnblock && <UnblockAccountDialog user={toUnblock} onClose={() => setToUnblock(null)} />}
    </div>
  )
}
