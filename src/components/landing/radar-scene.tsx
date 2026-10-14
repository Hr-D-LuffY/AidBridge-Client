'use client'

import { HandHeart, LifeBuoy, type LucideIcon, Tent } from 'lucide-react'
import { motion } from 'motion/react'
import { Emblem } from '@/components/layout/brand-logo'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

const LOOP = Number.POSITIVE_INFINITY

type Blip = {
  id: string
  icon: LucideIcon
  label: string
  tone: string
  // Position as a percentage of the radar, and how long its label takes to float up and down.
  left: number
  top: number
  float: number
  pulse?: boolean
}

const BLIPS: readonly Blip[] = [
  {
    id: 'sos',
    icon: LifeBuoy,
    label: 'SOS: water, medicine',
    tone: 'bg-primary text-primary-foreground',
    left: 24,
    top: 32,
    float: 4.2,
    pulse: true,
  },
  {
    id: 'volunteer-a',
    icon: HandHeart,
    label: 'Volunteer on the way',
    tone: 'bg-info text-background',
    left: 70,
    top: 20,
    float: 5.1,
  },
  {
    id: 'camp',
    icon: Tent,
    label: 'Relief camp',
    tone: 'bg-success text-background',
    left: 74,
    top: 68,
    float: 4.6,
  },
  {
    id: 'volunteer-b',
    icon: HandHeart,
    label: 'Collecting supplies',
    tone: 'bg-info text-background',
    left: 30,
    top: 78,
    float: 5.6,
  },
]

// Two routes drawn between the blips: a volunteer heading to the SOS, and one fetching supplies from
// the camp. The dashes march along each route.
const ROUTES = [
  { id: 'to-sos', d: 'M70 20 Q 50 22 24 32', className: 'stroke-info' },
  { id: 'to-camp', d: 'M30 78 Q 52 82 74 68', className: 'stroke-success' },
] as const

// The hero picture: a radar over a neighbourhood. A sweep turns around the AidBridge shield, an SOS
// pulses, volunteers travel toward it and a relief camp sits nearby. A drawing of the idea, not data.
export function RadarScene() {
  const reduce = usePrefersReducedMotion()

  return (
    <div
      role="img"
      aria-label="Illustration: a radar around the AidBridge shield, with an SOS request, two volunteers on their way and a relief camp."
      className="relative aspect-square w-full max-w-lg"
    >
      <div
        aria-hidden="true"
        className="absolute inset-[3%] overflow-hidden rounded-full border bg-card shadow-float"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[10%_10%] opacity-60" />
        {[24, 46, 70].map((inset) => (
          <span
            key={inset}
            className="absolute rounded-full border border-dashed border-foreground/15"
            style={{ inset: `${inset / 2}%` }}
          />
        ))}
        <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/10" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/10" />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, transparent 290deg, color-mix(in oklab, var(--primary) 45%, transparent) 360deg)',
          }}
          animate={reduce ? { rotate: 40 } : { rotate: 360 }}
          transition={{ duration: 7, ease: 'linear', repeat: LOOP }}
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          fill="none"
          className="absolute inset-0 size-full"
        >
          {ROUTES.map((route) => (
            <motion.path
              key={route.id}
              d={route.d}
              className={route.className}
              strokeWidth="0.7"
              strokeLinecap="round"
              strokeDasharray="1.6 2.2"
              animate={reduce ? undefined : { strokeDashoffset: [0, -15.2] }}
              transition={{ duration: 3, ease: 'linear', repeat: LOOP }}
            />
          ))}
        </svg>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 w-[17%] -translate-x-1/2 -translate-y-1/2 drop-shadow-lg"
      >
        <Emblem className="h-auto w-full" />
      </div>

      {BLIPS.map(({ id, icon: Icon, label, tone, left, top, float, pulse }) => (
        <div
          key={id}
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          <motion.div
            className="flex flex-col items-center gap-1.5"
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: float, ease: 'easeInOut', repeat: LOOP }}
          >
            <span className="relative grid size-10 place-items-center sm:size-12">
              {pulse && !reduce && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{ scale: [1, 2.1], opacity: [0.5, 0] }}
                  transition={{ duration: 2.2, ease: 'easeOut', repeat: LOOP }}
                />
              )}
              <span
                className={cn(
                  'relative grid size-full place-items-center rounded-full border-2 border-card shadow-card',
                  tone,
                )}
              >
                <Icon className="size-5" />
              </span>
            </span>
            <span className="rounded-full border bg-card px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-soft sm:text-xs">
              {label}
            </span>
          </motion.div>
        </div>
      ))}
    </div>
  )
}
