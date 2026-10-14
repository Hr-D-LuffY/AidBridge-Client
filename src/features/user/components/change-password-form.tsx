'use client'

import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { Button } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { useChangePassword } from '../user.queries'
import { type ChangePasswordFormInput, changePasswordFormSchema } from '../user.schema'

const FIELD_NAMES = ['currentPassword', 'newPassword'] as const

const EMPTY_VALUES: ChangePasswordFormInput = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

// Mounted only while the password card is open; `onDone` closes it after a change and on cancel.
export function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const change = useChangePassword()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: EMPTY_VALUES,
    validators: { onChange: changePasswordFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await change.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        })
        formApi.reset()
        onDone()
      } catch (error) {
        // A 401 here is "the current password is wrong", not "the session ended".
        if (isApiError(error) && error.isUnauthorized) {
          setServerFieldError(formApi, 'currentPassword', error.message)
        } else if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
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
      <form.AppField name="currentPassword">
        {(field) => (
          <field.PasswordField label="Current password" autoComplete="current-password" />
        )}
      </form.AppField>

      <form.AppField name="newPassword">
        {(field) => (
          <field.PasswordField
            label="New password"
            autoComplete="new-password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with a letter and a number.`}
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.PasswordField label="Confirm new password" autoComplete="new-password" />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-12 rounded-xl px-6" onClick={onDone}>
          Cancel
        </Button>
        <div className="sm:w-56">
          <form.AppForm>
            <form.SubmitButton>Change password</form.SubmitButton>
          </form.AppForm>
        </div>
      </div>
    </form>
  )
}
