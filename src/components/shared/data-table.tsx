import type { ReactNode } from 'react'
import { ListErrorState } from '@/components/shared/list-error-state'
import { PaginationBar } from '@/components/shared/pagination-bar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { PaginationMeta } from '@/types/api'

export type DataTableColumn<T> = {
  // Stable key for the column (React key, and the label's identity on the mobile card).
  id: string
  header: string
  cell: (row: T) => ReactNode
  align?: 'left' | 'right'
  // The column that titles each card on phones (name, camp, request). Shown without a label.
  primary?: boolean
  // Row actions (buttons, menus). Shown at the bottom of the card, without a label.
  actions?: boolean
  // Applied to the <td> / <th> on md and up.
  className?: string
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  rows: readonly T[] | undefined
  getRowId: (row: T) => string
  // Screen-reader name for the table, e.g. "Your requests".
  label: string
  isLoading?: boolean
  // True while a refetch (new page or filter) is running over the old rows.
  isFetching?: boolean
  isError?: boolean
  onRetry?: () => void
  // Shown when the query succeeded with no rows. Required so no list ever renders a blank table.
  empty: ReactNode
  pagination?: { meta: PaginationMeta; onPageChange: (page: number) => void }
  // How many skeleton rows to show while loading. Match the page size.
  skeletonRows?: number
  className?: string
}

const SKELETON_ROWS = 5

// [0, 1, 2, ...]: stable keys for the static skeleton placeholders.
const range = (count: number) => [...Array(count).keys()]

// The matching loading placeholder, also used on its own by loading.tsx files.
export function DataTableSkeleton({
  columns,
  rows = SKELETON_ROWS,
}: {
  columns: number
  rows?: number
}) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <ul className="flex flex-col gap-3 md:hidden">
        {range(rows).map((i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <div className="flex gap-6 border-b px-4 py-3">
          {range(columns).map((i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {range(rows).map((r) => (
          <div key={r} className="flex gap-6 border-b px-4 py-4 last:border-0">
            {range(columns).map((c) => (
              <Skeleton key={c} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// One table for every list in the app. A real <table> from md up; stacked cards below that, so
// nothing scrolls sideways on a phone. It holds no state: the page comes in as a prop and goes out
// as a callback, so the URL stays the single source of truth (see useQueryParams). The backend
// sorts every list itself, so there are no sortable headers. Plain markup with no hooks, so a
// Server Component can render it too (without the callbacks).
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  label,
  isLoading,
  isFetching,
  isError,
  onRetry,
  empty,
  pagination,
  skeletonRows,
  className,
}: DataTableProps<T>) {
  if (isLoading) return <DataTableSkeleton columns={columns.length} rows={skeletonRows} />

  if (isError) return <ListErrorState onRetry={onRetry} />

  if (!rows || rows.length === 0) return <>{empty}</>

  const primary = columns.find((column) => column.primary)
  const actions = columns.filter((column) => column.actions)
  const details = columns.filter((column) => column !== primary && !column.actions)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        aria-busy={isFetching || undefined}
        className={cn('transition-opacity', isFetching && 'opacity-60')}
      >
        <ul aria-label={label} className="flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <li
              key={getRowId(row)}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10"
            >
              {primary && <div className="font-semibold">{primary.cell(row)}</div>}
              <dl className="flex flex-col gap-2">
                {details.map((column) => (
                  <div key={column.id} className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{column.header}</dt>
                    <dd className="min-w-0 text-right">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
              {actions.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                  {actions.map((column) => (
                    <div key={column.id}>{column.cell(row)}</div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
          <Table aria-label={label}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      'h-11 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                      column.align === 'right' && 'text-right',
                      column.className,
                    )}
                  >
                    {column.actions ? (
                      <span className="sr-only">{column.header}</span>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        'px-4 py-3 whitespace-normal',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <PaginationBar
          meta={pagination.meta}
          onPageChange={pagination.onPageChange}
          disabled={isFetching}
        />
      )}
    </div>
  )
}
