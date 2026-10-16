'use client'

import { ArrowUpRight, Clock } from 'lucide-react'
import { useState } from 'react'
import { SectionHeading } from '@/components/landing/section-heading'
import { Stagger, StaggerItem } from '@/components/motion/stagger'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { GuideCover } from './guide-covers'
import { GUIDES, type Guide, getReadMinutes } from './guides-content'

// How each guide's tile looks and how much room it takes. The sizes make a gallery: one big tile, two
// squares, wide ones, and a banner to finish. Colours come from the theme (red, ink, soft blue,
// neutral) so the page keeps one palette while no two neighbours look alike.
type Layout = { tone: string; span: string; large?: boolean }

const LAYOUT: Record<string, Layout> = {
  flood: { tone: 'bg-info-soft text-foreground', span: 'sm:col-span-2 lg:row-span-2', large: true },
  cyclone: { tone: 'bg-foreground text-background', span: '' },
  earthquake: { tone: 'bg-accent text-accent-foreground', span: '' },
  fire: { tone: 'bg-primary text-primary-foreground', span: 'sm:col-span-2' },
  landslide: { tone: 'bg-secondary text-secondary-foreground', span: '' },
  'go-bag': { tone: 'bg-info-soft text-foreground', span: '' },
  'safe-water': { tone: 'bg-foreground text-background', span: 'sm:col-span-2 lg:col-span-1' },
  'first-aid': { tone: 'bg-accent text-accent-foreground', span: 'sm:col-span-2 lg:col-span-4' },
}

// go-bag is wide on a desktop only (a two-column row on a tablet has no room for it next to landslide).
const WIDE_ON_DESKTOP = new Set(['go-bag'])

// Only the tiles with room for a summary show one.
const SUMMARY_TILES = new Set(['flood', 'fire', 'go-bag', 'first-aid'])

function GuideTile({ guide, onOpen }: { guide: Guide; onOpen: () => void }) {
  const layout = LAYOUT[guide.id] ?? { tone: 'bg-card', span: '' }
  const large = layout.large || guide.id === 'first-aid'
  // Wider tiles have room for the summary; the small squares keep to a title and the button.
  const wide = SUMMARY_TILES.has(guide.id)
  return (
    <article
      className={cn(
        'group relative isolate flex h-full min-h-60 flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-soft transition-shadow hover:shadow-card sm:p-6',
        layout.tone,
      )}
    >
      <GuideCover id={guide.id} />

      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="border-current/30 bg-background/10 text-current">
          {guide.category}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs opacity-80">
          <Clock aria-hidden="true" className="size-3.5" />
          {getReadMinutes(guide)} min read
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <h3
          className={cn(
            'text-balance',
            large ? 'text-3xl sm:text-4xl' : wide ? 'text-2xl' : 'text-xl',
          )}
        >
          {guide.title}
        </h3>
        {wide && (
          <p className="max-w-lg text-pretty text-sm opacity-85 sm:text-base">{guide.summary}</p>
        )}
        {/* The whole tile is the click target: the button's ::after covers it. */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View details: ${guide.title}`}
          className="mt-2 inline-flex h-11 w-fit items-center gap-1.5 rounded-full bg-background px-4 text-sm font-bold text-foreground outline-none after:absolute after:inset-0 after:content-[''] focus-visible:ring-3 focus-visible:ring-ring/60"
        >
          View details
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </button>
      </div>
    </article>
  )
}

// The preparedness guides as a gallery of mixed-size tiles. "View details" opens the whole guide in a
// dialog, so a tile stays short and nothing needs a page of its own yet.
export function GuidesGallery() {
  const [openId, setOpenId] = useState<string | null>(null)
  const guide = GUIDES.find((item) => item.id === openId) ?? null

  return (
    <section
      id="guides"
      aria-labelledby="guides-heading"
      className="page-container scroll-mt-20 py-16 sm:py-20"
    >
      <SectionHeading
        id="guides-heading"
        eyebrow="Be prepared"
        title="Short guides for the moments before help arrives"
        text="Plain steps for the most common disasters. Read them now, while things are calm."
      />
      <Stagger
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:auto-rows-[15rem] lg:grid-cols-4"
        gap={0.06}
      >
        {GUIDES.map((item) => {
          const layout = LAYOUT[item.id]
          return (
            <StaggerItem
              key={item.id}
              className={cn(
                'min-w-0',
                layout?.span,
                WIDE_ON_DESKTOP.has(item.id) && 'lg:col-span-2',
              )}
            >
              <GuideTile guide={item} onOpen={() => setOpenId(item.id)} />
            </StaggerItem>
          )
        })}
      </Stagger>

      <Dialog open={guide !== null} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-w-xl">
          {guide && (
            <>
              <DialogHeader>
                <Badge variant="secondary" className="mb-1">
                  {guide.category}
                </Badge>
                <DialogTitle className="text-xl leading-snug">{guide.title}</DialogTitle>
                <DialogDescription>{guide.summary}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-5 overflow-y-auto py-2 pr-1">
                {guide.sections.map((section) => (
                  <section key={section.heading}>
                    <h4 className="text-base">{section.heading}</h4>
                    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-pretty marker:text-primary">
                      {section.items.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <p className="rounded-xl border bg-muted/50 p-3 text-xs text-pretty text-muted-foreground">
                General guidance only. Follow the instructions of your local authorities and call
                the emergency services if anyone is in danger.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
