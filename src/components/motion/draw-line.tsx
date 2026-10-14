'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

// A decorative line that grows from its left end to its right end when scrolled into view. It is moved
// with transform: scaleX only. Give it position and width with `className`.
export function DrawLine({ className, duration = 1.2 }: { className?: string; duration?: number }) {
  const reduce = usePrefersReducedMotion()

  return (
    <motion.span
      aria-hidden="true"
      className={cn('block h-0.5 origin-left bg-border', className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: reduce ? 0 : duration, ease: 'easeInOut' }}
    />
  )
}
