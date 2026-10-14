'use client'

import {
  Check,
  Droplets,
  HandHeart,
  LifeBuoy,
  Pause,
  Pill,
  Play,
  ShieldCheck,
  Siren,
} from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'
import { STAGES } from './landing-content'
import { useTabs } from './use-tabs'

type ChatLine = { from: 'volunteer' | 'victim' | 'system'; text: string }

// What the example request looks like at each of the five stages: where the volunteer's dot sits
// (a transform offset from the pin, in px) and what the chat says. A drawing of the interface, with no
// real person or place in it.
const SCENES: readonly {
  dot: { x: number; y: number; opacity: number }
  chat: readonly ChatLine[]
}[] = [
  { dot: { x: -120, y: -64, opacity: 0 }, chat: [] },
  {
    dot: { x: -120, y: -64, opacity: 1 },
    chat: [{ from: 'volunteer', text: 'I have accepted your request.' }],
  },
  {
    dot: { x: -48, y: -26, opacity: 1 },
    chat: [
      { from: 'volunteer', text: 'I have accepted your request.' },
      { from: 'victim', text: 'Thank you. I will wait at the school gate.' },
      { from: 'volunteer', text: 'On my way, about 10 minutes.' },
    ],
  },
  {
    dot: { x: 0, y: -2, opacity: 1 },
    chat: [
      { from: 'victim', text: 'Thank you. I will wait at the school gate.' },
      { from: 'volunteer', text: 'On my way, about 10 minutes.' },
      { from: 'volunteer', text: 'I am here. You are safe now.' },
    ],
  },
  {
    dot: { x: 0, y: -2, opacity: 0.35 },
    chat: [{ from: 'system', text: 'Request closed. Reason: help is no longer needed.' }],
  },
]

const VIEWS = [
  { key: 'victim', title: 'Person in need', icon: LifeBuoy },
  { key: 'volunteer', title: 'Volunteer', icon: HandHeart },
  { key: 'admin', title: 'Admins and NGOs', icon: ShieldCheck },
] as const

const STAGE_MS = 3200

// Follow one request through its five stages. A list of stages on the left (click or use the arrow
// keys) and a drawing of the request on the right that changes with it. It plays by itself while it is
// on screen, until you pick a stage or press pause.
export function JourneySection() {
  const reduce = usePrefersReducedMotion()
  const { index, setIndex, onKeyDown, setTabRef } = useTabs(STAGES.length)
  const [playing, setPlaying] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '-80px' })
  const running = playing && visible && !reduce
  const stage = STAGES[index] ?? STAGES[0]
  const scene = SCENES[index] ?? SCENES[0]

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setIndex((current) => (current + 1) % STAGES.length), STAGE_MS)
    return () => clearInterval(timer)
  }, [running, setIndex])

  if (!stage || !scene) return null

  return (
    <div
      ref={ref}
      className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]"
    >
      <div className="flex flex-col gap-6">
        <div
          role="tablist"
          aria-label="Stages of a request"
          onKeyDown={onKeyDown}
          className="grid grid-cols-5 gap-1.5 sm:gap-2"
        >
          {STAGES.map((item, position) => {
            const selected = position === index
            return (
              <button
                key={item.id}
                ref={setTabRef(position)}
                type="button"
                role="tab"
                id={`stage-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="stage-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setPlaying(false)
                  setIndex(position)
                }}
                className={cn(
                  'relative flex min-h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border px-1 py-2 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  selected ? 'border-primary bg-card shadow-card' : 'bg-background hover:bg-card',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full text-xs font-bold',
                    selected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {position + 1}
                </span>
                <span
                  className={cn('text-[11px] leading-tight sm:text-sm', selected && 'font-bold')}
                >
                  {item.label}
                </span>
                {selected && running && (
                  <motion.span
                    key={`${item.id}-timer`}
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 origin-left bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STAGE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${stage.id}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <h3 className="text-2xl">{stage.headline}</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {VIEWS.map(({ key, title, icon: Icon }) => (
                  <li key={key} className="flex gap-3 rounded-2xl border bg-card p-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{title}</p>
                      <p className="mt-0.5 text-sm text-pretty text-muted-foreground">
                        {stage[key]}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {!reduce && (
          <button
            type="button"
            onClick={() => setPlaying((current) => !current)}
            className="flex min-h-11 w-fit items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            {playing ? 'Pause animation' : 'Play animation'}
          </button>
        )}
      </div>

      <figure
        aria-label="Example of the request at the selected stage"
        className="relative mx-auto w-full max-w-sm lg:sticky lg:top-24"
      >
        <div className="relative h-48 overflow-hidden rounded-3xl border bg-card shadow-float">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[32px_32px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"
          />
          <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
            {[0, 1, 2].map((ring) => (
              <motion.span
                key={ring}
                className="absolute size-24 rounded-full border-2 border-primary"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={
                  reduce || index === 4
                    ? { scale: 1 + ring * 0.5, opacity: 0.15 }
                    : { scale: [0.5, 2.6], opacity: [0.5, 0] }
                }
                transition={
                  reduce || index === 4
                    ? { duration: 0 }
                    : {
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: ring,
                        ease: 'easeOut',
                      }
                }
              />
            ))}
            <span className="relative grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
              <Siren className="size-4" />
            </span>
            <motion.span
              className="absolute size-5 rounded-full border-2 border-card bg-info shadow-card"
              animate={scene.dot}
              transition={{ duration: reduce ? 0 : 1.2, ease: 'easeInOut' }}
            />
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Example
          </span>
        </div>

        <div className="relative z-10 mx-3 -mt-8 rounded-2xl border bg-card p-4 shadow-float">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <Siren className="size-4 text-high" aria-hidden="true" />
              SOS request
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-semibold text-info">
              <Droplets className="size-3.5" aria-hidden="true" />
              Water
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2.5 py-0.5 text-xs font-semibold text-info">
              <Pill className="size-3.5" aria-hidden="true" />
              Medicine
            </span>
          </div>

          <ol className="relative mt-5 grid grid-cols-5">
            <span
              aria-hidden="true"
              className="absolute top-3.5 right-[10%] left-[10%] h-0.5 -translate-y-1/2 bg-border"
            />
            <motion.span
              aria-hidden="true"
              className="absolute top-3.5 right-[10%] left-[10%] h-0.5 origin-left -translate-y-1/2 bg-success"
              animate={{ scaleX: index / (STAGES.length - 1) }}
              transition={{ duration: reduce ? 0 : 0.6, ease: 'easeInOut' }}
            />
            {STAGES.map((item, position) => {
              const done = position < index
              const active = position === index
              return (
                <li key={item.id} className="relative flex flex-col items-center gap-1 text-center">
                  <span
                    className={cn(
                      'grid size-7 place-items-center rounded-full border-2 bg-card text-[11px] font-bold transition-colors',
                      done && 'border-success bg-success text-background',
                      active && 'border-primary bg-primary text-primary-foreground',
                      !done && !active && 'border-border text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="size-3.5" aria-hidden="true" /> : position + 1}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] leading-tight',
                      active ? 'font-bold' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-4 flex min-h-28 flex-col justify-end gap-1.5" aria-hidden="true">
            <AnimatePresence initial={false} mode="popLayout">
              {scene.chat.map((message, position) => (
                <motion.p
                  key={message.text}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : position * 0.06 }}
                  className={cn(
                    'w-fit max-w-[90%] rounded-2xl px-3 py-1.5 text-sm',
                    message.from === 'victim' &&
                      'ml-auto rounded-br-sm bg-primary text-primary-foreground',
                    message.from === 'volunteer' && 'rounded-bl-sm bg-muted',
                    message.from === 'system' &&
                      'mx-auto bg-transparent text-center text-xs text-muted-foreground',
                  )}
                >
                  {message.text}
                </motion.p>
              ))}
            </AnimatePresence>
            {scene.chat.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for a volunteer nearby to accept.
              </p>
            )}
          </div>
        </div>
      </figure>
    </div>
  )
}
