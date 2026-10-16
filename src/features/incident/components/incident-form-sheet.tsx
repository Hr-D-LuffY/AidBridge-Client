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
import {
  INCIDENT_ADDRESS_MAX_LENGTH,
  INCIDENT_DESCRIPTION_MAX_LENGTH,
  INCIDENT_TITLE_MAX_LENGTH,
} from '@/lib/constants'
import { fromGeoPoint, type LatLng, toLngLat } from '@/lib/geo'
import type { DisasterType, Incident, UpdateIncidentPayload } from '@/types'
import { useCreateIncident, useUpdateIncident } from '../incident.queries'
import { type IncidentInput, incidentSchema, todayInputValue } from '../incident.schema'
import { DISASTER_OPTIONS } from '../incident.view'

const FIELD_NAMES = ['title', 'disasterType', 'address', 'description', 'startDate'] as const

type IncidentFormSheetProps = {
  // The incident being edited, or null to add a new one.
  incident: Incident | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toDefaults(incident: Incident | null): IncidentInput {
  return {
    title: incident?.title ?? '',
    disasterType: incident?.disasterType ?? '',
    address: incident?.address ?? '',
    description: incident?.description ?? '',
    startDate: incident ? incident.startDate.slice(0, 10) : todayInputValue(),
  }
}

const formatPosition = ({ lat, lng }: LatLng) => `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`

// Add a disaster to track, or change one. Where it happened is the pin on the map (tap, drag, or the
// location button). Editing sends only the fields that changed (the backend refuses an empty update).
// Priority, resolving and linked requests are on the incident's page. Mount it only while it is open, so
// it starts fresh.
export function IncidentFormSheet({ incident, open, onOpenChange }: IncidentFormSheetProps) {
  const create = useCreateIncident()
  const update = useUpdateIncident(incident?.id ?? '')
  const geo = useGeolocation()
  const [pin, setPin] = useState<LatLng | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [positionError, setPositionError] = useState<string | null>(null)

  // The pin the user placed, else the fix they asked for, else where the incident already is.
  const newPosition = pin ?? geo.position
  const shownPosition = newPosition ?? (incident ? fromGeoPoint(incident.location) : null)

  const form = useAppForm({
    defaultValues: toDefaults(incident),
    validators: { onChange: incidentSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      if (!shownPosition) {
        setPositionError('Tap the map where it happened, or use the location button.')
        return
      }
      const fields = incidentSchema.parse(value)
      const disasterType = fields.disasterType as DisasterType

      try {
        if (!incident) {
          await create.mutateAsync({
            title: fields.title,
            disasterType,
            coordinates: toLngLat(shownPosition),
            startDate: fields.startDate,
            ...(fields.address && { address: fields.address }),
            ...(fields.description && { description: fields.description }),
          })
        } else {
          const changes: UpdateIncidentPayload = {}
          if (fields.title !== incident.title) changes.title = fields.title
          if (disasterType !== incident.disasterType) changes.disasterType = disasterType
          if (fields.address !== (incident.address ?? '')) changes.address = fields.address
          if (fields.description !== (incident.description ?? '')) {
            changes.description = fields.description
          }
          if (fields.startDate !== incident.startDate.slice(0, 10)) {
            changes.startDate = fields.startDate
          }
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
          <SheetTitle>{incident ? 'Edit incident' : 'Add an incident'}</SheetTitle>
          <SheetDescription>
            {incident
              ? 'Change how the disaster is recorded. Priority and linked requests are on its page.'
              : 'Record a disaster so you can group the requests it caused and see how many people were rescued.'}
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
          <form.AppField name="title">
            {(field) => (
              <field.TextField
                label="Title"
                placeholder="For example Dhaka flood, October 2026"
                maxLength={INCIDENT_TITLE_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <form.AppField name="disasterType">
            {(field) => (
              <field.SelectField
                label="Kind of disaster"
                placeholder="Choose one"
                options={DISASTER_OPTIONS}
              />
            )}
          </form.AppField>

          <form.AppField name="startDate">
            {(field) => <field.TextField label="Started on" type="date" />}
          </form.AppField>

          <form.AppField name="address">
            {(field) => (
              <field.TextField
                label="Area or landmark"
                optional
                maxLength={INCIDENT_ADDRESS_MAX_LENGTH}
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
            <p className="text-sm text-muted-foreground">
              {shownPosition
                ? `Pin at ${formatPosition(shownPosition)}. Tap the map or drag the pin to move it.`
                : 'Tap the map where it happened, or use the location button if you are there.'}
            </p>
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

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Details"
                optional
                rows={4}
                maxLength={INCIDENT_DESCRIPTION_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <FormError message={serverError} />

          <form.AppForm>
            <form.SubmitButton>{incident ? 'Save changes' : 'Add incident'}</form.SubmitButton>
          </form.AppForm>
        </form>
      </SheetContent>
    </Sheet>
  )
}
