'use client'

import { MapPin, Save, Star, TriangleAlert } from 'lucide-react'
import { LocationMap } from '@/components/shared/location-map'
import { Switch } from '@/components/shared/switch'
import { Button } from '@/components/ui/button'
import { useLocationField } from '@/hooks/use-location-field'
import { getErrorMessage } from '@/lib/api/errors'
import { RATING_MAX } from '@/lib/constants'
import { fromGeoPoint, toLngLat } from '@/lib/geo'
import type { UserProfile } from '@/types'
import { useUpdateProfile } from '../user.queries'
import { ProfileSection } from './profile-section'

function ErrorLine({ error }: { error: unknown }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {getErrorMessage(error)}
    </p>
  )
}

// "Available for requests": a switch that saves as soon as it is flipped. While the save runs it shows
// the new state, and goes back to the saved one if the save fails.
function AvailabilitySwitch({ profile }: { profile: UserProfile }) {
  const update = useUpdateProfile('Availability updated.')
  const available = update.isPending
    ? (update.variables?.isAvailable ?? profile.isAvailable)
    : profile.isAvailable

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span id="availability-label" className="text-sm font-medium">
            {available ? 'Available' : 'Not available'}
          </span>
          <span id="availability-hint" className="text-sm text-muted-foreground">
            Turn this off when you cannot take on work, so NGOs and administrators know.
          </span>
        </div>
        <Switch
          checked={available}
          onChange={(isAvailable) => update.mutate({ isAvailable })}
          labelledBy="availability-label"
          describedBy="availability-hint"
          pending={update.isPending}
        />
      </div>
      {update.isError && <ErrorLine error={update.error} />}
    </div>
  )
}

function Reliability({ profile }: { profile: UserProfile }) {
  const { reliabilityScore, totalRatings } = profile
  return (
    <p className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm">
      <Star aria-hidden="true" className="size-4 shrink-0 text-warning" />
      {totalRatings > 0 ? (
        <span>
          <span className="font-semibold tabular-nums">
            {reliabilityScore.toFixed(1)} / {RATING_MAX}
          </span>{' '}
          from {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'} by the people you helped.
        </span>
      ) : (
        <span>No ratings yet. People you help can rate you once a task is completed.</span>
      )}
    </p>
  )
}

// Where the volunteer is. The browser's position is only asked for when the button is pressed, and the
// pin can be placed or dragged by hand instead.
function LocationEditor({ profile }: { profile: UserProfile }) {
  const field = useLocationField({ autoRequest: false })
  const save = useUpdateProfile('Location saved.')

  const saved = profile.location ? fromGeoPoint(profile.location) : null
  const position = field.position ?? saved
  const changed = field.position !== null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Searches for volunteers near a camp or an incident only find you when a location is saved.
        {saved ? ' Tap the map or drag the pin to move it.' : ' None is saved yet.'}
      </p>

      <LocationMap
        position={position}
        accuracyMeters={field.accuracyMeters}
        onChange={field.setPin}
        onLocate={field.locate}
        locating={field.status === 'locating'}
        className="h-72"
      />

      {field.message && <output className="text-sm text-muted-foreground">{field.message}</output>}
      {save.isError && <ErrorLine error={save.error} />}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 px-4"
          disabled={field.status === 'locating'}
          onClick={field.locate}
        >
          <MapPin aria-hidden="true" />
          Use my current location
        </Button>
        <Button
          type="button"
          className="h-11 gap-2 px-5"
          disabled={!changed || save.isPending}
          onClick={() => field.position && save.mutate({ location: toLngLat(field.position) })}
        >
          <Save aria-hidden="true" />
          {save.isPending ? 'Saving…' : 'Save location'}
        </Button>
      </div>
    </div>
  )
}

// Only volunteers see this: availability, their rating and where they are.
export function VolunteerSettings({ profile }: { profile: UserProfile }) {
  return (
    <ProfileSection
      title="Volunteer settings"
      description="How administrators and NGOs find and rely on you."
    >
      <AvailabilitySwitch profile={profile} />
      <Reliability profile={profile} />
      {/* A new saved location starts the editor fresh, so a placed pin does not linger. */}
      <LocationEditor key={profile.location?.coordinates.join(',') ?? 'none'} profile={profile} />
    </ProfileSection>
  )
}
