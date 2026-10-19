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
import { SOS_ADDRESS_MAX_LENGTH, SOS_DESCRIPTION_MAX_LENGTH } from '@/lib/constants'
import { fromGeoPoint, type LatLng, toLngLat } from '@/lib/geo'
import type { SosRequest, UpdateSosPayload } from '@/types'
import { useUpdateSos } from '../sos.queries'
import { type SosFieldsInput, sosFieldsSchema } from '../sos.schema'
import { SosMediaEditor } from './sos-media-editor'

const FIELD_NAMES = ['needs', 'requiredSkills', 'description', 'address', 'coordinates'] as const

const sameSet = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((item) => b.includes(item))

type EditSosSheetProps = {
  sos: SosRequest
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Change what a request says. Only the fields that really changed are sent: the backend refuses an
// empty update, and the volunteer on the request is told about each change.
export function EditSosSheet({ sos, open, onOpenChange }: EditSosSheetProps) {
  const update = useUpdateSos(sos.id)
  const geo = useGeolocation()
  const [pin, setPin] = useState<LatLng | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  // The pin the user placed, else the fix they just asked for, else where the request already is.
  const newPosition = pin ?? geo.position
  const shownPosition = newPosition ?? fromGeoPoint(sos.location)

  const form = useAppForm({
    defaultValues: {
      needs: sos.needs,
      requiredSkills: sos.requiredSkills,
      description: sos.description ?? '',
      address: sos.address ?? '',
    } as SosFieldsInput,
    validators: { onChange: sosFieldsSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      const fields = sosFieldsSchema.parse(value)

      const changes: UpdateSosPayload = {}
      if (!sameSet(fields.needs, sos.needs)) changes.needs = fields.needs
      if (!sameSet(fields.requiredSkills, sos.requiredSkills)) {
        changes.requiredSkills = fields.requiredSkills
      }
      if (fields.description !== (sos.description ?? '')) changes.description = fields.description
      if (fields.address !== (sos.address ?? '')) changes.address = fields.address
      if (newPosition) changes.coordinates = toLngLat(newPosition)

      if (Object.keys(changes).length === 0) {
        toast.info('Nothing was changed.')
        onOpenChange(false)
        return
      }

      try {
        await update.mutateAsync(changes)
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
          <SheetTitle>Edit request</SheetTitle>
          <SheetDescription>
            Keep it up to date. The volunteer on your request is told when you change it. Photos you
            add or remove here take effect at once.
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
          <form.AppField name="needs">
            {(field) => <field.NeedsField label="What do you need?" />}
          </form.AppField>

          <form.AppField name="requiredSkills">
            {(field) => <field.SkillsField label="Special help needed" />}
          </form.AppField>

          <form.AppField name="address">
            {(field) => (
              <field.TextField
                label="Address or landmark"
                optional
                maxLength={SOS_ADDRESS_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.TextareaField
                label="Additional details"
                optional
                rows={4}
                maxLength={SOS_DESCRIPTION_MAX_LENGTH}
              />
            )}
          </form.AppField>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Location</p>
            <LocationMap
              className="h-56"
              position={shownPosition}
              accuracyMeters={pin ? null : geo.accuracyMeters}
              onChange={setPin}
              onLocate={() => {
                setPin(null)
                geo.request()
              }}
              locating={geo.isLocating}
            />
            <p className="text-sm text-muted-foreground">
              Use the location button on the map, or tap the map where you are.
            </p>
            {geo.message && (
              <p role="alert" className="text-sm text-destructive">
                {geo.message}
              </p>
            )}
          </div>

          <FormError message={serverError} />

          <form.AppForm>
            <form.SubmitButton>Save changes</form.SubmitButton>
          </form.AppForm>
        </form>

        {/* Outside the form: photos are added and removed on the spot, not with "Save changes". */}
        <div className="border-t p-4">
          <SosMediaEditor sos={sos} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
