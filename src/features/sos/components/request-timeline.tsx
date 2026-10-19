'use client'

import {
  BellRing,
  CheckCheck,
  CircleArrowUp,
  CircleX,
  Hourglass,
  Info,
  type LucideIcon,
  Navigation,
  Pause,
  Play,
  Radar,
  Send,
  TimerOff,
  TriangleAlert,
  Undo2,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundX,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { usePolling } from '@/hooks/use-polling'
import { POLL_INTERVAL_MS } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'
import { SosEventType, type SosRequest } from '@/types'
import { isSosFinished, useSosTimelineQuery } from '../sos.queries'
import { buildTimeline } from '../sos.timeline'

const EVENT_ICON: Record<SosEventType, LucideIcon> = {
  [SosEventType.OFFERED]: BellRing,
  [SosEventType.ACCEPTED]: UserRoundCheck,
  [SosEventType.DECLINED]: CircleX,
  [SosEventType.EXPIRED]: TimerOff,
  [SosEventType.OFFERS_WITHDRAWN]: Undo2,
  [SosEventType.ESCALATED]: Radar,
  [SosEventType.PRIORITY_RAISED]: CircleArrowUp,
  [SosEventType.UNSERVED]: TriangleAlert,
  [SosEventType.SET_OFF_TIMEOUT]: Hourglass,
  [SosEventType.BACKED_OUT]: UserRoundX,
  [SosEventType.ON_THE_WAY]: Navigation,
  [SosEventType.COMPLETED]: CheckCheck,
  [SosEventType.UNASSIGNED]: UserRoundMinus,
  [SosEventType.PAUSED]: Pause,
  [SosEventType.RESUMED]: Play,
}

function iconFor(type: string): LucideIcon {
  return type in EVENT_ICON ? EVENT_ICON[type as SosEventType] : Info
}

// "What has happened" on a request, in plain words and oldest first. It starts with the request being
// raised (which the timeline itself does not list) and asks again while the request is open.
export function RequestTimeline({ sos }: { sos: SosRequest }) {
  const poll = usePolling(POLL_INTERVAL_MS.sosStatus, !isSosFinished(sos.status))
  const query = useSosTimelineQuery(sos.id, poll)

  const lines = query.data ? buildTimeline(query.data.items) : []

  return (
    <section className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:p-5">
      <h2 className="text-base font-semibold">What has happened</h2>

      <ol className="flex flex-col">
        <TimelineRow
          icon={Send}
          text="You raised this request."
          at={sos.createdAt}
          last={lines.length === 0 && !query.isPending}
        />
        {query.isPending && (
          <li aria-hidden="true" className="pl-10">
            <Skeleton className="my-2 h-10 w-full rounded-lg" />
          </li>
        )}
        {lines.map((line, index) => (
          <TimelineRow
            key={line.id}
            icon={iconFor(line.type)}
            text={line.text}
            at={line.at}
            last={index === lines.length - 1}
          />
        ))}
      </ol>

      {query.isError && !query.data && (
        <p role="alert" className="text-sm text-muted-foreground">
          We could not load the rest of the history. It will try again by itself.
        </p>
      )}
    </section>
  )
}

function TimelineRow({
  icon: Icon,
  text,
  at,
  last,
}: {
  icon: LucideIcon
  text: string
  at: string
  last: boolean
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && (
        <span aria-hidden="true" className="absolute top-8 bottom-0 left-4 w-px bg-border" />
      )}
      <span
        aria-hidden="true"
        className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 pt-1">
        <p className="text-sm text-pretty">{text}</p>
        <time dateTime={at} className="text-xs text-muted-foreground">
          {formatDateTime(at)}
        </time>
      </div>
    </li>
  )
}
