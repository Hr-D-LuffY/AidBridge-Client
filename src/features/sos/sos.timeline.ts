import { SosEventType, type SosTimelineItem } from '@/types'

// What happened to a request, in the words its victim reads. The victim's timeline carries a type and a
// time only (no names, no distances), so every line is general: "a volunteer", never who.

type LineText = { one: string; many?: string }

const LINE_TEXT: Record<SosEventType, LineText> = {
  [SosEventType.OFFERED]: {
    one: 'A nearby volunteer was asked to help.',
    many: 'Nearby volunteers were asked to help.',
  },
  [SosEventType.ACCEPTED]: { one: 'A volunteer accepted your request.' },
  [SosEventType.DECLINED]: {
    one: 'A volunteer could not take it.',
    many: 'Some volunteers could not take it.',
  },
  [SosEventType.EXPIRED]: { one: 'An offer went unanswered, so we kept looking.' },
  [SosEventType.OFFERS_WITHDRAWN]: { one: 'Other volunteers were told the request was taken.' },
  [SosEventType.ESCALATED]: { one: 'We widened the search to reach volunteers further away.' },
  [SosEventType.PRIORITY_RAISED]: {
    one: 'Your request was marked more urgent so that it is seen sooner.',
  },
  [SosEventType.UNSERVED]: {
    one: 'No volunteer has accepted yet. Our team has been told and we keep trying.',
  },
  [SosEventType.SET_OFF_TIMEOUT]: {
    one: 'The volunteer did not set off in time, so we are finding someone else.',
  },
  [SosEventType.BACKED_OUT]: {
    one: 'The volunteer could not continue. We are finding someone else.',
  },
  [SosEventType.ON_THE_WAY]: { one: 'Your volunteer set off and is on the way.' },
  [SosEventType.COMPLETED]: { one: 'The volunteer finished the task.' },
  [SosEventType.UNASSIGNED]: {
    one: 'Our team took the request back from the volunteer. We are finding someone else.',
  },
  [SosEventType.PAUSED]: {
    one: 'Our team paused automatic matching while they choose a volunteer by hand.',
  },
  [SosEventType.RESUMED]: { one: 'Automatic matching was switched back on.' },
}

const UNKNOWN_TEXT = 'Your request was updated.'

function isKnown(type: string): type is SosEventType {
  return type in LINE_TEXT
}

export type TimelineLine = {
  // The first event of the run, so a key stays the same while the run grows.
  id: string
  type: string
  at: string
  text: string
}

// Oldest first, with a run of the same event shown once ("three volunteers were asked" is one line, not
// three), at the time of the first of the run.
export function buildTimeline(items: readonly SosTimelineItem[]): TimelineLine[] {
  const ordered = [...items].sort((a, b) => a.at.localeCompare(b.at))
  const lines: (TimelineLine & { count: number })[] = []

  for (const item of ordered) {
    const last = lines.at(-1)
    if (last && last.type === item.type) {
      last.count += 1
      continue
    }
    lines.push({ id: item.id, type: item.type, at: item.at, text: '', count: 1 })
  }

  return lines.map(({ count, ...line }) => {
    const text = isKnown(line.type) ? LINE_TEXT[line.type] : null
    return { ...line, text: text ? (count > 1 && text.many ? text.many : text.one) : UNKNOWN_TEXT }
  })
}

// Events that start the search over: a volunteer took the request, or one who had it let it go (dispatch
// then begins again from the first radius).
const SEARCH_RESETS: readonly string[] = [
  SosEventType.ACCEPTED,
  SosEventType.BACKED_OUT,
  SosEventType.SET_OFF_TIMEOUT,
  SosEventType.UNASSIGNED,
]

export type SearchState = {
  // The search area was widened since the last time the search began.
  widened: boolean
  // The request was marked more urgent by the engine.
  raised: boolean
  // Dispatch ran out of rounds; it still retries.
  unserved: boolean
}

// How the current search for a volunteer is going, read from the events since it last began. The victim
// is never sent the staff `dispatch` block, so this is all they can know.
export function getSearchState(items: readonly SosTimelineItem[]): SearchState {
  const ordered = [...items].sort((a, b) => a.at.localeCompare(b.at))
  let lastReset = -1
  ordered.forEach((item, index) => {
    if (SEARCH_RESETS.includes(item.type)) lastReset = index
  })
  const current = ordered.slice(lastReset + 1)
  const has = (type: SosEventType) => current.some((item) => item.type === type)
  return {
    widened: has(SosEventType.ESCALATED),
    raised: has(SosEventType.PRIORITY_RAISED),
    unserved: has(SosEventType.UNSERVED),
  }
}
