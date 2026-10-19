'use client'

import { Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { FileUpload } from '@/components/shared/file-upload'
import { LocationMap } from '@/components/shared/location-map'
import { LocationStatus } from '@/components/shared/location-status'
import { useAppForm } from '@/hooks/use-app-form'
import { useLocationField } from '@/hooks/use-location-field'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { MAX_ACTIVE_SOS, SOS_ADDRESS_MAX_LENGTH, SOS_DESCRIPTION_MAX_LENGTH } from '@/lib/constants'
import { toLngLat } from '@/lib/geo'
import type { CreateSosPayload } from '@/types'
import { useCreateSos } from '../sos.queries'
import { type SosFieldsInput, sosFieldsSchema } from '../sos.schema'

const FIELD_NAMES = ['needs', 'requiredSkills', 'description', 'address'] as const

// The most important screen of the product. The map comes first with the location box floating on it;
// the details sit in a panel beside it (below it on a phone) with Send pinned to the bottom. The
// location is asked for as the page opens and is the device's own GPS fix only: the pin cannot be
// moved here, so a request always starts from where the person really is. They can correct it later
// from the edit sheet if they move.
export function RaiseSosForm() {
  const router = useRouter()
  const create = useCreateSos()
  const location = useLocationField()
  const [files, setFiles] = useState<File[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      needs: [],
      requiredSkills: [],
      description: '',
      address: '',
    } as SosFieldsInput,
    validators: { onChange: sosFieldsSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      if (!location.position) {
        setServerError(
          'We need your current location so a volunteer can find you. Allow location access in your browser, then tap Retry.',
        )
        return
      }

      const fields = sosFieldsSchema.parse(value)
      const payload: CreateSosPayload = {
        needs: fields.needs,
        coordinates: toLngLat(location.position),
        ...(fields.requiredSkills.length > 0 && { requiredSkills: fields.requiredSkills }),
        ...(fields.description && { description: fields.description }),
        ...(fields.address && { address: fields.address }),
      }

      try {
        const { sos, mediaError } = await create.mutateAsync({
          payload,
          files,
          onProgress: setProgress,
        })
        toast.success('Your request was sent. Volunteers nearby can see it now.')
        if (mediaError) {
          toast.warning(
            `Your request is saved, but the photos did not upload: ${mediaError}. You can add them on this page.`,
            { duration: 10_000 },
          )
        }
        router.push(`/dashboard/sos/${sos.id}`)
      } catch (error) {
        setProgress(null)
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  const limitReached = isApiError(create.error) && create.error.isConflict

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-6">
      <div className="relative isolate lg:sticky lg:top-24">
        <LocationMap
          className="h-[48dvh] min-h-80 lg:h-[calc(100dvh-8rem)] lg:min-h-[28rem]"
          position={location.position}
          accuracyMeters={location.accuracyMeters}
          onLocate={location.locate}
          locating={location.status === 'locating'}
        />
        <div className="absolute top-3 right-3 left-14 z-10">
          <LocationStatus
            className="shadow-md"
            status={location.status}
            source={location.source}
            position={location.position}
            accuracyMeters={location.accuracyMeters}
            message={location.message}
            allowPin={false}
            onLocate={location.locate}
          />
        </div>
      </div>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-6 rounded-2xl border bg-card p-4 sm:p-5"
      >
        <header className="flex flex-col gap-1">
          <p className="w-fit rounded-md border border-primary/40 bg-sidebar-accent px-2.5 py-0.5 text-xs font-bold tracking-widest text-sidebar-accent-foreground uppercase">
            Emergency request
          </p>
          <h1 className="text-2xl">Request rescue &amp; aid</h1>
          <p className="text-sm text-muted-foreground">
            Your current location and phone number are shared with the volunteer who takes your
            request. If you move, you can update your location later by editing the request.
          </p>
        </header>

        <form.AppField name="needs">
          {(field) => <field.NeedsField label="What do you need?" />}
        </form.AppField>

        <form.AppField name="requiredSkills">
          {(field) => (
            <field.SkillsField
              label="Special help needed"
              hint="Tick only what applies. Your request is sent either way."
            />
          )}
        </form.AppField>

        <form.AppField name="address">
          {(field) => (
            <field.TextField
              label="Address or landmark"
              optional
              maxLength={SOS_ADDRESS_MAX_LENGTH}
              placeholder="House, road, village, or a place nearby"
              hint="Optional, but it helps a volunteer find you."
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
              placeholder="Your situation, how many people, any injuries, anything a volunteer should know."
            />
          )}
        </form.AppField>

        <FileUpload
          label="Photos or videos"
          files={files}
          onFilesChange={setFiles}
          progress={progress}
          disabled={create.isPending || create.isSuccess}
        />

        <p className="flex gap-2 rounded-xl bg-info-soft p-3 text-sm text-info">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          You can have up to {MAX_ACTIVE_SOS} open requests at a time. Closing one frees a place.
        </p>

        <div className="sticky bottom-0 -mx-4 -mb-4 flex flex-col gap-3 border-t bg-card/95 p-4 backdrop-blur sm:-mx-5 sm:-mb-5 sm:p-5">
          <FormError message={serverError} />
          {limitReached && (
            <Link
              href="/dashboard/sos"
              className="text-sm font-medium text-link underline-offset-4 hover:underline"
            >
              See my open requests
            </Link>
          )}
          <form.AppForm>
            <form.SubmitButton
              disabled={create.isSuccess}
              className="h-14 bg-cta text-lg font-bold text-cta-foreground hover:bg-cta/90"
            >
              Send emergency request
            </form.SubmitButton>
          </form.AppForm>
        </div>
      </form>
    </div>
  )
}
