'use client'

import { TriangleAlert } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// Small animated drawings for the landing page's bento tiles. Each one illustrates an idea with
// made-up example values (labelled as examples where a number appears), starts when it scrolls into
// view, and is decoration only (aria-hidden): the tile's text carries the meaning.

const VIEW = { once: true, margin: '-40px' } as const

// Requests listed by distance, nearest first. The bars grow from the left in order.
const NEARBY = [
  { distance: '0.8 km', need: 'Water', width: 92 },
  { distance: '2.4 km', need: 'Medicine', width: 64 },
  { distance: '6.1 km', need: 'Shelter', width: 38 },
] as const

export function NearbyVisual() {
  const reduce = usePrefersReducedMotion()
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5">
      {NEARBY.map((row, index) => (
        <div key={row.distance} className="flex items-center gap-3 text-xs">
          <span className="w-14 shrink-0 font-bold tabular-nums">{row.distance}</span>
          <div className="h-7 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="flex h-full origin-left items-center rounded-full bg-primary px-3 font-semibold text-primary-foreground"
              style={{ width: `${row.width}%` }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEW}
              transition={{
                duration: reduce ? 0 : 0.7,
                delay: reduce ? 0 : index * 0.15,
                ease: 'easeOut',
              }}
            >
              {row.need}
            </motion.div>
          </div>
        </div>
      ))}
      <span className="text-[11px] text-muted-foreground">Example, nearest first</span>
    </div>
  )
}

// The area a volunteer sees before accepting (a wide circle) narrowing to the exact spot after.
export function PrivacyVisual() {
  const reduce = usePrefersReducedMotion()
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (reduce) return
    const timer = setInterval(() => setAccepted((current) => !current), 2800)
    return () => clearInterval(timer)
  }, [reduce])

  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-3">
      <div className="relative grid size-32 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary bg-primary/10"
          animate={{ scale: accepted ? 0.16 : 1, opacity: accepted ? 0.9 : 0.8 }}
          transition={{ duration: reduce ? 0 : 0.9, ease: 'easeInOut' }}
        />
        <span className="relative size-3.5 rounded-full bg-primary shadow-card ring-4 ring-card" />
      </div>
      <span
        className={cn(
          'rounded-full px-3 py-1 text-xs font-bold transition-colors',
          accepted ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
        )}
      >
        {accepted ? 'Exact location' : 'Approximate area'}
      </span>
    </div>
  )
}

const BUBBLES = [
  { from: 'volunteer', text: 'I have accepted your request.' },
  { from: 'victim', text: 'Thank you. I am at the gate.' },
  { from: 'volunteer', text: 'Almost there.' },
] as const

export function ChatVisual() {
  const reduce = usePrefersReducedMotion()
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {BUBBLES.map((bubble, index) => (
        <motion.p
          key={bubble.text}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.2 + index * 0.35 }}
          className={cn(
            'w-fit max-w-[90%] rounded-2xl px-3.5 py-2 text-sm',
            bubble.from === 'victim'
              ? 'ml-auto rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted',
          )}
        >
          {bubble.text}
        </motion.p>
      ))}
    </div>
  )
}

const STOCK = [
  { item: 'Food', level: 82, low: false },
  { item: 'Water', level: 54, low: false },
  { item: 'Medicine', level: 12, low: true },
] as const

export function StockVisual() {
  const reduce = usePrefersReducedMotion()
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {STOCK.map((row, index) => (
        <div key={row.item} className="flex items-center gap-3 text-xs">
          <span className="w-16 shrink-0 font-semibold">{row.item}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn(
                'h-full origin-left rounded-full',
                row.low ? 'bg-warning' : 'bg-success',
              )}
              style={{ width: `${row.level}%` }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEW}
              transition={{
                duration: reduce ? 0 : 0.9,
                delay: reduce ? 0 : index * 0.18,
                ease: 'easeOut',
              }}
            />
          </div>
          {row.low && (
            <span className="flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-bold text-warning">
              <TriangleAlert className="size-3" /> Low
            </span>
          )}
        </div>
      ))}
      <span className="text-[11px] text-muted-foreground">Example stock levels</span>
    </div>
  )
}

const BARS = [38, 62, 46, 82, 70, 94] as const

export function AnalyticsVisual() {
  const reduce = usePrefersReducedMotion()
  return (
    <div aria-hidden="true" className="flex h-24 items-end gap-2">
      {BARS.map((height, index) => (
        <motion.span
          key={height}
          className="flex-1 origin-bottom rounded-t-md bg-primary/80"
          style={{ height: `${height}%` }}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={VIEW}
          transition={{
            duration: reduce ? 0 : 0.6,
            delay: reduce ? 0 : index * 0.09,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
