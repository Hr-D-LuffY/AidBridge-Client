'use client'

import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import { FAQ } from './landing-content'

// An accordion that opens one answer at a time. Each question is a real button (expanded state and
// the panel it controls are announced), and the answer slides open with a grid-row transition that the
// global reduced-motion rule switches off.
export function Faq() {
  const baseId = useId()
  const [open, setOpen] = useState<number | null>(0)

  return (
    <ul className="mx-auto mt-12 flex max-w-3xl flex-col gap-3">
      {FAQ.map((item, index) => {
        const expanded = open === index
        const buttonId = `${baseId}-q${index}`
        const panelId = `${baseId}-a${index}`
        return (
          <li
            key={item.question}
            className={cn(
              'rounded-2xl border bg-card transition-colors',
              expanded && 'border-primary/50 shadow-card',
            )}
          >
            <h3 className="text-base">
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : index)}
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl px-5 py-3 text-left text-base font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.question}
                <ChevronDown
                  className={cn(
                    'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
                    expanded && 'rotate-180 text-primary',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <section
              id={panelId}
              aria-labelledby={buttonId}
              aria-hidden={!expanded}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-pretty text-muted-foreground">{item.answer}</p>
              </div>
            </section>
          </li>
        )
      })}
    </ul>
  )
}
