import { cn } from '@/lib/utils'

export type PlaceRow = { label: string; value: string }

// 'open' is green and 'full' amber (camps). The four priorities colour a request: critical red, high
// orange, medium amber, low blue. 'task' (violet) is a request the volunteer has taken.
export type PlaceTone = 'open' | 'full' | 'critical' | 'high' | 'medium' | 'low' | 'task'

export type PlaceStatus = { label: string; tone: PlaceTone }

// The dark card that opens when a place on a map is hovered or tapped: small uppercase labels with
// their values, and an optional last row with a coloured dot. Both camp maps use it, so the hover looks
// the same on each. Styles: `.classic-card` in globals.css. Plain markup with no hooks.
export function PlaceCard({
  rows,
  status,
  hint,
}: {
  rows: readonly PlaceRow[]
  status?: PlaceStatus
  // A last line that says what a click does ("Click for full details →").
  hint?: string
}) {
  return (
    <div className="classic-card">
      {rows.map((row) => (
        <div key={row.label} className="classic-card__row">
          <span className="classic-card__key">{row.label}</span>
          <span>{row.value}</span>
        </div>
      ))}
      {status && (
        <div className="classic-card__row">
          <span
            aria-hidden="true"
            className={cn('classic-card__dot', `classic-card__dot-${status.tone}`)}
          />
          <span>{status.label}</span>
        </div>
      )}
      {hint && <div className="classic-card__hint">{hint}</div>}
    </div>
  )
}
