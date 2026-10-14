import { LoaderCircle, MapPin, MapPinOff, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeolocationStatus } from '@/hooks/use-geolocation'
import type { LocationSource } from '@/hooks/use-location-field'
import type { LatLng } from '@/lib/geo'
import { cn } from '@/lib/utils'

type LocationStatusProps = {
  status: GeolocationStatus
  source: LocationSource | null
  position: LatLng | null
  accuracyMeters: number | null
  message: string | null
  // False where the pin cannot be placed by hand (raising an SOS: GPS only), so the text must not
  // tell the user to tap the map.
  allowPin?: boolean
  onLocate: () => void
  className?: string
}

function formatCoordinates({ lat, lng }: LatLng) {
  return `${Math.abs(lat).toFixed(5)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(5)}°${lng >= 0 ? 'E' : 'W'}`
}

// One line that says where the request will be sent from, and how sure we are: finding, found,
// placed by hand, or unavailable. The same box sits above the map in both SOS layouts.
export function LocationStatus({
  status,
  source,
  position,
  accuracyMeters,
  message,
  allowPin = true,
  onLocate,
  className,
}: LocationStatusProps) {
  const locating = status === 'locating' || status === 'idle'
  const failed = status === 'denied' || status === 'unavailable'

  const title = failed
    ? 'Location unavailable'
    : locating
      ? 'Finding your location…'
      : source === 'pin'
        ? 'Pin placed on the map'
        : 'Location found'

  const detail = failed
    ? allowPin
      ? message
      : 'Allow location access for this site in your browser, then tap Retry.'
    : locating
      ? `Waiting for the GPS signal.${allowPin ? ' You can also tap the map.' : ''}`
      : position
        ? `${formatCoordinates(position)}${accuracyMeters ? ` · about ${Math.round(accuracyMeters)} m` : ''}`
        : null

  const Icon = locating ? LoaderCircle : failed ? MapPinOff : MapPin

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3',
        failed
          ? 'border-destructive/40 bg-destructive-soft'
          : position
            ? 'border-success/40 bg-success-soft'
            : 'bg-card',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'size-6 shrink-0',
          locating && 'animate-spin text-muted-foreground',
          failed && 'text-destructive',
          !locating && !failed && 'text-success',
        )}
      />
      <div aria-live="polite" className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {detail && (
          <p className={cn('text-xs text-muted-foreground', !failed && 'font-mono')}>{detail}</p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-10 shrink-0 gap-1.5 px-3"
        disabled={status === 'locating'}
        onClick={onLocate}
      >
        <RotateCw aria-hidden="true" />
        {failed ? 'Retry' : 'Refresh'}
      </Button>
    </div>
  )
}
