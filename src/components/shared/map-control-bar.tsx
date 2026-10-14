import { RotateCw } from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'

export type MapControlChip = { label: string; tone: 'blue' | 'amber' | 'green' | 'red' }

type MapControlBarProps = {
  // The radius buttons. Leave out for a map that has no search radius.
  radius?: {
    valueKm: number
    options: readonly number[]
    onChange: (km: number) => void
  }
  onRefresh: () => void
  // Disables Refresh: no position yet, or a request is already running.
  refreshDisabled: boolean
  refreshing: boolean
  // When the data was last loaded (ms since the epoch), or 0 before the first answer.
  updatedAt: number
  error: string | null
  // The counts on the right ("3 TOTAL", "1 FULL").
  chips: readonly MapControlChip[]
}

// The strip above a map, as in the first AidBridge: "RADIUS" with its buttons, a Refresh button, how
// long ago the data was loaded, and the counts on the right. It goes into the `header` of `PlacesMap`,
// so it shares the map's frame. Styles: `.classic-bar` in globals.css. Plain markup with no hooks.
export function MapControlBar({
  radius,
  onRefresh,
  refreshDisabled,
  refreshing,
  updatedAt,
  error,
  chips,
}: MapControlBarProps) {
  return (
    <div className="classic-bar">
      {radius && (
        <>
          <span aria-hidden="true" className="classic-bar__label">
            Radius:
          </span>
          <fieldset className="classic-bar__group min-w-0 border-0 p-0">
            <legend className="sr-only">Radius</legend>
            {radius.options.map((km) => (
              <button
                key={km}
                type="button"
                aria-pressed={km === radius.valueKm}
                onClick={() => radius.onChange(km)}
                className="classic-pill"
              >
                {km} km
              </button>
            ))}
          </fieldset>
        </>
      )}

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshDisabled}
        className="classic-pill inline-flex items-center gap-1.5"
      >
        <RotateCw
          aria-hidden="true"
          className={refreshing ? 'size-3.5 animate-spin' : 'size-3.5'}
        />
        {refreshing ? 'Loading…' : 'REFRESH'}
      </button>

      {updatedAt > 0 && (
        <span className="classic-bar__note">Updated {formatRelativeTime(new Date(updatedAt))}</span>
      )}
      {error && (
        <span role="alert" className="classic-bar__error">
          {error}
        </span>
      )}

      <div className="classic-bar__chips">
        {chips.map((chip) => (
          <span key={chip.label} className={`classic-chip classic-chip-${chip.tone}`}>
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  )
}
