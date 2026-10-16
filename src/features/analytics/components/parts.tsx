import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCount, percentOf, type Slice, sumSlices } from '../analytics.model'

// The small pieces the dashboard and report layouts are built from. All of them are plain markup (no hooks,
// no chart library), so they render on the server and cost the browser nothing.

type PanelProps = {
  title: string
  description?: string
  // On the right of the title: a link, a badge.
  action?: ReactNode
  className?: string
  children: ReactNode
}

// A titled card around a chart or a list.
export function Panel({ title, description, action, className, children }: PanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="font-heading text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

export const SEE_ALL_LINK =
  'inline-flex min-h-11 items-center rounded-md text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'

// One bar split into the slices of a whole, with a 2 px gap between them. A slice of 0 takes no room.
export function StackedBar({ slices, label }: { slices: Slice[]; label: string }) {
  const total = sumSlices(slices)
  const shown = slices.filter((slice) => slice.value > 0)
  return (
    <div
      role="img"
      aria-label={`${label}: ${shown.map((slice) => `${formatCount(slice.value)} ${slice.label.toLowerCase()}`).join(', ') || 'nothing yet'}`}
      className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted"
    >
      {total > 0 &&
        shown.map((slice) => (
          <span
            key={slice.key}
            aria-hidden="true"
            className="h-full min-w-1.5 first:rounded-l-full last:rounded-r-full"
            style={{ flexGrow: slice.value, backgroundColor: slice.color }}
          />
        ))}
    </div>
  )
}

// A single bar filled to a share of a whole.
export function MeterBar({
  value,
  max,
  color,
  className,
}: {
  value: number
  max: number
  color: string
  className?: string
}) {
  const share = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div
      aria-hidden="true"
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${share}%`, minWidth: value > 0 ? '0.375rem' : 0, backgroundColor: color }}
      />
    </div>
  )
}

const ROW_LINK =
  'rounded-md outline-none transition-colors hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50'

// Each slice as a row: swatch, name, count and share. It is the legend of a chart and also its data in
// words, so the numbers never depend on hover or colour.
export function SliceList({ slices, total }: { slices: Slice[]; total?: number }) {
  const whole = total ?? sumSlices(slices)
  return (
    <ul className="flex flex-col">
      {slices.map((slice) => {
        const row = (
          <>
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: slice.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm">{slice.label}</span>
            <span className="text-sm font-semibold tabular-nums">{formatCount(slice.value)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {percentOf(slice.value, whole)}%
            </span>
          </>
        )
        const classes = 'flex min-h-9 items-center gap-2 px-1.5 pointer-coarse:min-h-11'
        return (
          <li key={slice.key}>
            {slice.href ? (
              <Link href={slice.href} className={cn(classes, ROW_LINK)}>
                {row}
              </Link>
            ) : (
              <div className={classes}>{row}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// A heading for a sentence about the data when there is none to draw.
export function NothingYet({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">{children}</p>
  )
}
