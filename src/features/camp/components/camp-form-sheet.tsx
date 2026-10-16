'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { LocationMap } from '@/components/shared/location-map'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppForm } from '@/hooks/use-app-form'
import { useGeolocation } from '@/hooks/use-geolocation'
import { getErrorMessage } from '@/lib/api/errors'
import { CAMP_ADDRESS_MAX_LENGTH, CAMP_NAME_MAX_LENGTH } from '@/lib/constants'
import { fromGeoPoint, type LatLng, toLngLat } from '@/lib/geo'
import type { ManagedCamp, UpdateCampPayload } from '@/types'
import { useCreateCamp, useUpdateCamp } from '../camp.queries'
import { type CampInput, campSchema } from '../camp.schema'

const FIELD_NAMES = ['name', 'address', 'capacity', 'currentOccupancy', 'isActive'] as const

type CampFormSheetProps = {
  // The camp being edited, or null to add a new one.
  camp: ManagedCamp | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toDefaults(camp: ManagedCamp | null): CampInput {
  return {
    name: camp?.name ?? '',
    address: camp?.address ?? '',
    capacity: camp ? String(camp.capacity) : '',
    currentOccupancy: '',
    isActive: camp?.isActive ?? true,
  }
}

const formatPosition = ({ lat, lng }: LatLng) => `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`

// Add a relief camp, or change one. The camp's place is the pin on the map: tap where it is, drag the
// pin, or use the location button when you are standing there. Editing sends only the fields that
// changed (the backend refuses an empty update). How many people are inside is changed with the
// check-in buttons on the camp's card, so only a new camp asks for a starting number. Mount it only
// while it is open, so it starts fresh.
export function CampFormSheet({ camp, open, onOpenChange }: CampFormSheetProps) {
  const create = useCreateCamp()
  const update = useUpdateCamp(camp?.id ?? '')
  const geo = useGeolocation()
  const [pin, setPin] = useState<LatLng | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [positionError, setPositionError] = useState<string | null>(null)

  // The pin the user placed, else the fix they asked for, else where the camp already is.
  const newPosition = pin ?? geo.position
  const shownPosition = newPosition ?? (camp ? fromGeoPoint(camp.location) : null)

  const form = useAppForm({
    defaultValues: toDefaults(camp),
    validators: { onChange: campSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      if (!shownPosition) {
        setPositionError('Tap the map where the camp is, or use the location button.')
        return
      }
      const fields = campSchema.parse(value)
      const capacity = Number(fields.capacity)

      try {
        if (!camp) {
          await create.mutateAsync({
            name: fields.name,
            coordinates: toLngLat(shownPosition),
            capacity,
            isActive: fields.isActive,
            ...(fields.address && { address: fields.address }),
            ...(fields.currentOccupancy !== '' && {
              currentOccupancy: Number(fields.currentOccupancy),
            }),
          })
        } else {
          const changes: UpdateCampPayload = {}
          if (fields.name !== camp.name) changes.name = fields.name
          if (fields.address !== (camp.address ?? '')) changes.address = fields.address
          if (capacity !== camp.capacity) changes.capacity = capacity
          if (fields.isActive !== camp.isActive) changes.isActive = fields.isActive
          if (newPosition) changes.coordinates = toLngLat(newPosition)

          if (Object.keys(changes).length === 0) {
            toast.info('Nothing was changed.')
            onOpenChange(false)
            return
          }
          await update.mutateAsync(changes)
        }
        onOpenChange(false)
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{camp ? 'Edit camp' : 'Add a relief camp'}</SheetTitle>
          <SheetDescription>
            {camp
              ? 'Change how the camp is listed. Victims see open camps and the places they have left.'
              : 'Victims near it see the camp and how many places are left. You can assign volunteers and keep stock in it afterwards.'}
          </SheetDescription>
        </SheetHeader>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            form.handleSubmit()
          }}
          className="flex flex-col gap-5 p-4"
        >
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Camp name"
                placeholder="For example Mirpur Relief Camp"
                maxLength={CAMP_NAME_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <form.AppField name="address">
            {(field) => (
              <field.TextField
                label="Address or landmark"
                optional
                maxLength={CAMP_ADDRESS_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Where is it?</p>
            <LocationMap
              className="h-56"
              position={shownPosition}
              accuracyMeters={pin ? null : geo.accuracyMeters}
              onChange={(position) => {
                setPin(position)
                setPositionError(null)
              }}
              onLocate={() => {
                setPin(null)
                setPositionError(null)
                geo.request()
              }}
              locating={geo.isLocating}
            />
            {shownPosition ? (
              <p className="text-sm text-muted-foreground">
                Pin at {formatPosition(shownPosition)}. Tap the map or drag the pin to move it.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap the map where the camp is, or use the location button if you are there.
              </p>
            )}
            {positionError && (
              <p role="alert" className="text-sm text-destructive">
                {positionError}
              </p>
            )}
            {geo.message && (
              <p role="alert" className="text-sm text-destructive">
                {geo.message}
              </p>
            )}
          </div>

          <form.AppField name="capacity">
            {(field) => (
              <field.TextField
                label="Capacity (people)"
                inputMode="numeric"
                placeholder="For example 200"
              />
            )}
          </form.AppField>

          {!camp && (
            <form.AppField name="currentOccupancy">
              {(field) => (
                <field.TextField
                  label="People already inside"
                  optional
                  inputMode="numeric"
                  hint="Leave blank if the camp is empty. After this, use the check-in buttons on the camp."
                />
              )}
            </form.AppField>
          )}

          <form.AppField name="isActive">
            {(field) => (
              <field.CheckboxField
                label="Open for people"
                hint="Closed camps are hidden from victims and cannot be handed out from."
              />
            )}
          </form.AppField>

          <FormError message={serverError} />

          <form.AppForm>
            <form.SubmitButton>{camp ? 'Save changes' : 'Add camp'}</form.SubmitButton>
          </form.AppForm>
        </form>
      </SheetContent>
    </Sheet>
  )
}
