'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// recharts is heavy, so the charts load as their own chunk, fetched only on the pages that draw one and
// drawn in the browser (a chart has no use on the server). Each skeleton holds its chart's size so nothing
// jumps when the chart arrives.
export const DonutChart = dynamic(
  () => import('./charts-impl').then((module) => module.DonutChart),
  {
    ssr: false,
    loading: () => <Skeleton aria-hidden="true" className="mx-auto size-48 rounded-full" />,
  },
)

export const ColumnChart = dynamic(
  () => import('./charts-impl').then((module) => module.ColumnChart),
  { ssr: false, loading: () => <Skeleton aria-hidden="true" className="h-60 w-full rounded-lg" /> },
)

export const RankedBarChart = dynamic(
  () => import('./charts-impl').then((module) => module.RankedBarChart),
  { ssr: false, loading: () => <Skeleton aria-hidden="true" className="h-56 w-full rounded-lg" /> },
)
