'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// The bridge from the AidBridge logo, drawn large and decorative: the radar waves, the arch with its
// inner arch and cables, the relief cross and the beacon. It draws itself when it appears, then the
// radar waves keep a slow pulse. Same geometry as <Emblem/>. Pure decoration (aria-hidden), moved only
// with stroke length and opacity. Give the parent `relative`; this fills the box its class sizes.
//
// Colours: the logo's own red-to-blue bridge by default (fixed colours, because it is logo artwork), or
// `mono` to draw in the current text colour, for use on a coloured background.
export function BridgeBackdrop({
  className,
  mono = false,
  stretch = false,
}: {
  className?: string
  mono?: boolean
  // Fill whatever box the classes give it, even a wider one than the logo's proportions, so the
  // bridge can grow wider without growing taller.
  stretch?: boolean
}) {
  const reduce = usePrefersReducedMotion()
  const draw = (delay: number, duration: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      duration: reduce ? 0 : duration,
      delay: reduce ? 0 : delay,
      ease: 'easeInOut' as const,
    },
  })
  const pulse = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { opacity: [0.9, 0.25, 0.9] },
          transition: {
            duration: 3.6,
            delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut' as const,
          },
        }
  const arch = mono ? 'currentColor' : 'url(#bridge-grad)'
  const accent = mono ? 'currentColor' : '#ff5c61'
  const cable = mono ? 'currentColor' : '#abb6c4'

  return (
    <svg
      aria-hidden="true"
      viewBox="34 14 122 146"
      preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}
      fill="none"
      className={cn('pointer-events-none absolute', className)}
    >
      {!mono && (
        <defs>
          <linearGradient id="bridge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff5c61" />
            <stop offset="50%" stopColor="#abb6c4" />
            <stop offset="100%" stopColor="#5083f1" />
          </linearGradient>
        </defs>
      )}

      <motion.path
        d="M 55 60 A 52 52 0 0 1 135 60"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 5"
        {...draw(1.4, 0.8)}
        {...pulse(0)}
      />
      <motion.path
        d="M 68 72 A 34 34 0 0 1 122 72"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        {...draw(1.6, 0.8)}
        {...pulse(0.9)}
      />
      <motion.path
        d="M 42 145 C 60 100, 130 100, 148 145"
        stroke={arch}
        strokeWidth="5"
        strokeLinecap="round"
        {...draw(0, 1.6)}
      />
      <motion.path
        d="M 54 153 C 70 120, 120 120, 136 153"
        stroke={cable}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
        {...draw(0.4, 1.4)}
      />
      <motion.path
        d="M76 116V142M95 107V138M114 116V142"
        stroke={cable}
        strokeWidth="1.6"
        strokeLinecap="round"
        {...draw(1, 0.8)}
      />
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 1.2 }}
      >
        <rect x="87" y="67" width="16" height="46" rx="4" fill={accent} />
        <rect x="72" y="82" width="46" height="16" rx="4" fill={accent} />
      </motion.g>
      <motion.circle
        cx="95"
        cy="22"
        r="3.5"
        fill={accent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 1.8 }}
      />
    </svg>
  )
}
