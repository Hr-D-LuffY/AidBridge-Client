import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { SectionError } from '@/components/shared/section-error'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  aidRows,
  formatCount,
  percentOf,
  prioritySlices,
  type ReportData,
  reportSlices,
  statusSlices,
} from '../analytics.model'
import {
  type Change,
  changeOf,
  type Figures,
  figuresOf,
  type Kind,
  showValue,
} from '../report-model'
import { MeterBar, NothingYet, SliceList, StackedBar } from './parts'

const NOW_COLOR = 'var(--chart-2)'
const BEFORE_COLOR = 'var(--muted-foreground)'

function SheetHeading({ children }: { children: string }) {
  return <h3 className="border-b pb-2 text-base">{children}</h3>
}

// An arrow and the words, so the direction never rests on the arrow or a colour alone.
function ChangeText({ change }: { change: Change }) {
  const Arrow = change.direction === 0 ? Minus : change.direction > 0 ? ArrowUp : ArrowDown
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums">
      <Arrow aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      {change.text}
    </span>
  )
}

// The figures, in the order a reader asks: how many, how it went, how fast, who joined. `share` is the
// figure as a part of the requests raised.
const ROWS: { key: keyof Figures; label: string; kind: Kind; share?: boolean }[] = [
  { key: 'raised', label: 'Requests raised', kind: 'count' },
  { key: 'rescued', label: 'Rescued', kind: 'count', share: true },
  { key: 'waiting', label: 'Waiting for a volunteer', kind: 'count', share: true },
  {
    key: 'inProgress',
    label: 'Help under way (assigned or on the way)',
    kind: 'count',
    share: true,
  },
  { key: 'closed', label: 'Closed', kind: 'count', share: true },
  { key: 'critical', label: 'Critical priority', kind: 'count', share: true },
  { key: 'rate', label: 'Rescue rate', kind: 'percent' },
  { key: 'response', label: 'Average response time', kind: 'minutes' },
  { key: 'accounts', label: 'New accounts registered', kind: 'count' },
]

// The report: one document for the period, set beside the stretch of the same length just before it when
// there is one. A heading with the period, where the requests stand, one figures table with each figure's
// share, its value before and how far it moved, then the priorities and the aid handed out the same way.
// "Since the start" has nothing before it, so there the before and change columns are left out.
export function ReportView({ report, analytics, period, preparedOn, previous }: ReportData) {
  if (!report) return <SectionError title="The report" />

  const total = report.totalSOSRequests
  const now = figuresOf(report, analytics)
  const before = previous ? figuresOf(previous.report, previous.analytics) : null
  const slices = analytics ? statusSlices(analytics.requestsByStatus) : reportSlices(report)

  const priority = analytics ? prioritySlices(analytics.requestsByPriority) : []
  const priorityBefore = previous?.analytics
    ? prioritySlices(previous.analytics.requestsByPriority)
    : null

  const aid = analytics ? aidRows(analytics) : []
  const aidBefore = previous?.analytics ? aidRows(previous.analytics) : null

  return (
    <article className="flex flex-col gap-8 rounded-2xl border bg-card p-5 shadow-soft sm:p-8">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">AidBridge relief report</p>
        <h2 className="text-2xl text-balance">Requests and response {period}</h2>
        <p className="text-sm text-muted-foreground">
          Prepared on {preparedOn}.{' '}
          {previous
            ? `Compared with ${previous.text}, a stretch of the same length.`
            : 'There is no earlier period to compare with: pick 7, 30 or 90 days, or two dates, to see how things moved.'}
        </p>
      </header>

      <section aria-label="Where the requests stand" className="flex flex-col gap-3">
        <StackedBar slices={slices} label="Where the requests stand" />
        <div className="grid gap-x-8 sm:grid-cols-2">
          <SliceList slices={slices.slice(0, 3)} total={total} />
          <SliceList slices={slices.slice(3)} total={total} />
        </div>
      </section>

      <section aria-label="Figures" className="flex flex-col gap-3">
        <SheetHeading>Figures</SheetHeading>
        <Table>
          <caption className="sr-only">Figures {period}</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Figure</TableHead>
              <TableHead className="text-right">Now</TableHead>
              {before && <TableHead className="text-right">Before</TableHead>}
              {before && <TableHead className="text-right">Change</TableHead>}
              {before && (
                <TableHead className="hidden w-44 lg:table-cell">
                  <span className="sr-only">Now and before as bars</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ROWS.map((row) => {
              const nowValue = now[row.key]
              const beforeValue = before ? before[row.key] : null
              const max = row.kind === 'percent' ? 100 : Math.max(nowValue ?? 0, beforeValue ?? 0)
              return (
                <TableRow key={row.key}>
                  <TableCell className="font-medium whitespace-normal">{row.label}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="font-semibold">{showValue(nowValue, row.kind)}</span>
                    {row.share && nowValue !== null && total > 0 && (
                      <span className="block text-xs text-muted-foreground">
                        {percentOf(nowValue, total)}% of requests
                      </span>
                    )}
                  </TableCell>
                  {before && (
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {showValue(beforeValue, row.kind)}
                    </TableCell>
                  )}
                  {before && (
                    <TableCell className="text-right">
                      <ChangeText change={changeOf(nowValue, beforeValue, row.kind)} />
                    </TableCell>
                  )}
                  {before && (
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <MeterBar value={nowValue ?? 0} max={max} color={NOW_COLOR} />
                        <MeterBar value={beforeValue ?? 0} max={max} color={BEFORE_COLOR} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {before && (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="hidden items-center gap-1.5 lg:flex">
              <span
                aria-hidden="true"
                className="h-2 w-4 rounded-full"
                style={{ backgroundColor: NOW_COLOR }}
              />
              Now (top bar)
            </span>
            <span className="hidden items-center gap-1.5 lg:flex">
              <span
                aria-hidden="true"
                className="h-2 w-4 rounded-full"
                style={{ backgroundColor: BEFORE_COLOR }}
              />
              Before (bottom bar)
            </span>
            {(!analytics || !previous?.analytics) && (
              <span>
                Some figures could not be loaded and show a dash. Refresh the page to try again.
              </span>
            )}
          </p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-label="Priority" className="flex flex-col gap-3">
          <SheetHeading>Requests by priority</SheetHeading>
          {priority.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {priority.map((slice, index) => {
                const beforeValue = priorityBefore ? (priorityBefore[index]?.value ?? null) : null
                return (
                  <li key={slice.key} className="flex flex-col gap-1.5">
                    <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-[2px]"
                          style={{ backgroundColor: slice.color }}
                        />
                        {slice.label}
                      </span>
                      <span className="flex items-baseline gap-3">
                        <span className="font-semibold tabular-nums">
                          {formatCount(slice.value)}
                        </span>
                        {priorityBefore && (
                          <span className="text-xs text-muted-foreground">
                            before {showValue(beforeValue, 'count')} ·{' '}
                            <ChangeText change={changeOf(slice.value, beforeValue, 'count')} />
                          </span>
                        )}
                      </span>
                    </p>
                    <MeterBar value={slice.value} max={total} color={slice.color} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <NothingYet>
              The priorities could not be loaded. Refresh the page to try again.
            </NothingYet>
          )}
        </section>

        <section aria-label="Aid handed out" className="flex flex-col gap-3">
          <SheetHeading>Aid handed out</SheetHeading>
          {aid.length > 0 ? (
            <Table>
              <caption className="sr-only">Aid handed out {period}</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Handed out</TableHead>
                  {aidBefore && <TableHead className="text-right">Before</TableHead>}
                  {aidBefore && <TableHead className="text-right">Change</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {aid.map((row) => {
                  // An item missing from the earlier top 20 was handed out less, which is 0 unless that list was full.
                  const earlier = aidBefore?.find((item) => item.key === row.key)
                  const beforeValue = aidBefore
                    ? (earlier?.total ?? (aidBefore.length >= 20 ? null : 0))
                    : null
                  return (
                    <TableRow key={row.key}>
                      <TableCell className="font-medium whitespace-normal">
                        {row.item}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {row.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCount(row.total)}
                      </TableCell>
                      {aidBefore && (
                        <TableCell className="text-right text-muted-foreground tabular-nums">
                          {showValue(beforeValue, 'count')}
                        </TableCell>
                      )}
                      {aidBefore && (
                        <TableCell className="text-right">
                          <ChangeText change={changeOf(row.total, beforeValue, 'count')} />
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <NothingYet>
              {analytics
                ? `Nothing was handed out ${period}.`
                : 'The hand-outs could not be loaded.'}
            </NothingYet>
          )}
        </section>
      </div>

      <footer className="border-t pt-3 text-xs text-muted-foreground">
        Requests are counted by the day they were raised, aid by the day it was handed out and new
        accounts by the day they signed up. The response time runs from a request being raised to a
        volunteer accepting it.
      </footer>
    </article>
  )
}
