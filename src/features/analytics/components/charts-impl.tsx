'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { formatCount, percentOf, type Slice } from '../analytics.model'

// The three charts the dashboard and the report share. recharts is heavy, so charts.tsx loads this file as
// its own chunk, only on the pages that draw one. The caller puts a plain list or table next to each chart:
// nothing here is the only way to read a number.

const CONFIG = { value: { label: 'Count' } } satisfies ChartConfig

function isSlice(value: unknown): value is Slice {
  return typeof value === 'object' && value !== null && 'label' in value && 'value' in value
}

type TipProps = {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: unknown }>
  unit: string
  total?: number
}

function Tip({ active, payload, unit, total }: TipProps) {
  const row = active ? payload?.[0]?.payload : undefined
  if (!isSlice(row)) return null
  return (
    <div className="grid min-w-40 gap-1 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-card">
      <p className="flex items-center gap-1.5 font-medium">
        <span
          aria-hidden="true"
          className="size-2.5 shrink-0 rounded-[2px]"
          style={{ backgroundColor: row.color }}
        />
        {row.label}
      </p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{unit}</span>
        <span className="font-medium tabular-nums">{formatCount(row.value)}</span>
      </p>
      {total !== undefined && total > 0 && (
        <p className="text-muted-foreground tabular-nums">
          {percentOf(row.value, total)}% of {formatCount(total)}
        </p>
      )}
    </div>
  )
}

type DonutProps = {
  rows: Slice[]
  total: number
  // Under the total in the middle: "requests".
  centerLabel: string
  unit: string
}

// A ring split by share, with the total in the middle. A slice of 0 is left out of the ring (it still has
// its row in the list beside it).
export function DonutChart({ rows, total, centerLabel, unit }: DonutProps) {
  const reduceMotion = usePrefersReducedMotion()
  const drawn = rows.filter((row) => row.value > 0)

  return (
    <div className="relative mx-auto aspect-square w-full max-w-60">
      <ChartContainer config={CONFIG} className="aspect-square size-full">
        <PieChart>
          <ChartTooltip content={<Tip unit={unit} total={total} />} />
          <Pie
            data={drawn}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={drawn.length > 1 ? 2 : 0}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={!reduceMotion}
          >
            {drawn.map((row) => (
              <Cell key={row.key} fill={row.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl tabular-nums">{formatCount(total)}</span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  )
}

type BarsProps = { rows: Slice[]; unit: string; height?: number }

// One column per row, each in its own colour, the count printed on top.
export function ColumnChart({ rows, unit, height = 240 }: BarsProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer config={CONFIG} className="aspect-auto w-full" style={{ height }}>
      <BarChart accessibilityLayer data={rows} margin={{ top: 20, right: 8, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<Tip unit={unit} />} />
        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={56}
          isAnimationActive={!reduceMotion}
        >
          {rows.map((row) => (
            <Cell key={row.key} fill={row.color} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            className="fill-foreground text-xs font-semibold"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

const ROW_HEIGHT = 40

// One bar per row, longest first, the count printed at the end so nothing depends on hovering.
export function RankedBarChart({ rows, unit }: BarsProps) {
  const reduceMotion = usePrefersReducedMotion()

  return (
    <ChartContainer
      config={CONFIG}
      className="aspect-auto w-full"
      style={{ height: rows.length * ROW_HEIGHT + 8 }}
    >
      <BarChart
        accessibilityLayer
        layout="vertical"
        data={rows}
        margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
        barCategoryGap="28%"
      >
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={112}
          tickLine={false}
          axisLine={false}
          tickFormatter={(label: string) =>
            label.length > 16 ? `${label.slice(0, 15)}...` : label
          }
        />
        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<Tip unit={unit} />} />
        <Bar dataKey="value" radius={6} isAnimationActive={!reduceMotion}>
          {rows.map((row) => (
            <Cell key={row.key} fill={row.color} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            offset={8}
            className="fill-foreground text-xs font-semibold"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
