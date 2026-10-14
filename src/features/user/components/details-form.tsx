'use client'

import { Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { NAME_MAX_LENGTH } from '@/lib/constants'
import type { UserProfile } from '@/types'
import { useUpdateProfile } from '../user.queries'
import {
  hasProfileEdits,
  PHONE_REMOVE_MESSAGE,
  type ProfileFormInput,
  profileFormSchema,
  toProfileChanges,
} from '../user.schema'

const FIELD_NAMES = ['name', 'phone'] as const

// Name and phone. Email and role cannot be changed (the backend answers 400), so they are not fields.
// Only the fields that changed are sent. It is mounted only while editing, so each edit starts from
// what is saved; `onDone` goes back to the read-only view after a save and on cancel.
export function DetailsForm({ profile, onDone }: { profile: UserProfile; onDone: () => void }) {
  const update = useUpdateProfile('Profile saved.')
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { name: profile.name, phone: profile.phone ?? '' } as ProfileFormInput,
    validators: { onChange: profileFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      if (value.phone.trim() === '' && profile.phone) {
        setServerFieldError(formApi, 'phone', PHONE_REMOVE_MESSAGE)
        return
      }
      const changes = toProfileChanges(value, profile)
      if (Object.keys(changes).length === 0) {
        toast.info('Nothing has changed.')
        return
      }
      try {
        await update.mutateAsync(changes)
        onDone()
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Full name"
            icon={UserRound}
            autoComplete="name"
            maxLength={NAME_MAX_LENGTH}
          />
        )}
      </form.AppField>

      <form.AppField name="phone">
        {(field) => (
          <field.TextField
            label="Phone"
            type="tel"
            icon={Phone}
            optional={!profile.phone}
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
            hint={
              profile.phone
                ? 'Volunteers and the people they help contact each other by phone.'
                : 'Needed to apply as a volunteer. Volunteers and the people they help contact each other by phone.'
            }
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-12 rounded-xl px-6" onClick={onDone}>
          Cancel
        </Button>
        <div className="sm:w-56">
          <form.Subscribe selector={(state) => hasProfileEdits(state.values, profile)}>
            {(edited) => (
              <form.AppForm>
                <form.SubmitButton disabled={!edited}>Save changes</form.SubmitButton>
              </form.AppForm>
            )}
          </form.Subscribe>
        </div>
      </div>
    </form>
  )
}
