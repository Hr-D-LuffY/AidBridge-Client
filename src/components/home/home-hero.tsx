'use client'

import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { RadarScene } from '@/components/landing/radar-scene'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { HERO_SLIDES } from './home-content'

const SLIDE_MS = 7000
const BUTTON = 'h-12 rounded-xl px-5 text-base font-semibold'

// The first screen, held to about two thirds of the viewport on a desktop (60 to 70 percent). Three
// slides say what the product is for each kind of person; they change by themselves every few seconds,
// stop while the pointer or keyboard focus is inside, never start for people who asked for less motion,
// and can be paused, stepped or jumped to. The radar beside them is the picture; the arrow below
// leads to the next section.
export function HomeHero() {
  const reduce = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [engaged, setEngaged] = useState(false)
  const autoplay = playing && !engaged && !reduce

  // `index` is a dependency so stepping by hand restarts the timer instead of skipping right away.
  // biome-ignore lint/correctness/useExhaustiveDependencies: index restarts the timer on purpose
  useEffect(() => {
    if (!autoplay) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [autoplay, index])

  const go = (next: number) => setIndex((next + HERO_SLIDES.length) % HERO_SLIDES.length)

  return (
    <section
      aria-label="Introduction"
      className="relative isolate overflow-hidden lg:h-[clamp(30rem,66svh,44rem)]"
    >
      {/* Colour behind the radar, and a faint grid that fades out toward the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_55%_at_75%_35%,color-mix(in_oklch,var(--primary)_20%,transparent),transparent),radial-gradient(35%_40%_at_8%_95%,color-mix(in_oklch,var(--info)_16%,transparent),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_14%,transparent)_1px,transparent_1px)] bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]"
      />

      <div className="page-container grid h-full items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-8 lg:pb-14">
        <section
          aria-roledescription="carousel"
          aria-label="What AidBridge is for"
          className="flex flex-col gap-6"
          onMouseEnter={() => setEngaged(true)}
          onMouseLeave={() => setEngaged(false)}
          onFocus={() => setEngaged(true)}
          onBlur={() => setEngaged(false)}
        >
          <h1 className="sr-only">AidBridge: disaster response and relief coordination</h1>

          {/* All slides share one grid cell, so the box is as tall as the tallest and never jumps. */}
          <div className="grid" aria-live={autoplay ? 'off' : 'polite'}>
            {HERO_SLIDES.map((slide, position) => {
              const active = position === index
              return (
                // biome-ignore lint/a11y/useSemanticElements: the carousel pattern puts role="group" on a slide; a fieldset would be a form control
                <div
                  key={slide.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${position + 1} of ${HERO_SLIDES.length}`}
                  aria-hidden={!active}
                  inert={!active}
                  className={cn(
                    'col-start-1 row-start-1 flex flex-col items-start gap-5 transition-[opacity,translate] duration-500 motion-reduce:transition-none',
                    active
                      ? 'translate-y-0 opacity-100'
                      : 'pointer-events-none translate-y-2 opacity-0',
                  )}
                >
                  <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 text-sm font-semibold backdrop-blur">
                    <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
                    {slide.badge}
                  </p>
                  <h2 className="text-4xl leading-[1.1] text-balance sm:text-5xl">
                    {slide.headline}{' '}
                    <span className="bg-linear-to-r from-primary to-high bg-clip-text text-transparent">
                      {slide.accent}
                    </span>
                    .
                  </h2>
                  <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
                    {slide.text}
                  </p>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link
                      href={slide.primary.href}
                      className={cn(
                        buttonVariants(),
                        BUTTON,
                        'w-full bg-cta text-cta-foreground hover:bg-cta/90 sm:w-auto',
                      )}
                    >
                      {slide.primary.label}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                    <Link
                      href={slide.secondary.href}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        BUTTON,
                        'w-full sm:w-auto',
                      )}
                    >
                      {slide.secondary.label}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Previous slide"
              onClick={() => go(index - 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </Button>
            <div className="flex items-center">
              {HERO_SLIDES.map((slide, position) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${position + 1} of ${HERO_SLIDES.length}`}
                  aria-current={position === index ? 'true' : undefined}
                  onClick={() => go(position)}
                  className="group grid size-11 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span
                    className={cn(
                      'h-2 rounded-full transition-all duration-300 motion-reduce:transition-none',
                      position === index
                        ? 'w-7 bg-primary'
                        : 'w-2 bg-foreground/25 group-hover:bg-foreground/45',
                    )}
                  />
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Next slide"
              onClick={() => go(index + 1)}
            >
              <ChevronRight aria-hidden="true" />
            </Button>
            {!reduce && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={playing ? 'Pause the slides' : 'Play the slides'}
                onClick={() => setPlaying((value) => !value)}
              >
                {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              </Button>
            )}
          </div>
        </section>

        {/* Sized from the viewport height so it never pushes the hero past its limit. */}
        <div className="hidden justify-end lg:flex">
          <div className="w-[clamp(18rem,44svh,28rem)]">
            <RadarScene />
          </div>
        </div>
      </div>

      <a
        href="#numbers"
        className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 lg:flex"
      >
        Scroll to explore
        <ChevronDown aria-hidden="true" className="size-5 motion-safe:animate-bounce" />
      </a>
    </section>
  )
}
