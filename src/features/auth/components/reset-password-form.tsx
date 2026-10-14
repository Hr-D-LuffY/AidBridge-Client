'use client'

import { ArrowLeft, CircleCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { buttonVariants } from '@/components/ui/button'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useResetPasswordMutation } from '../auth.queries'
import { type ResetPasswordFormInput, resetPasswordFormSchema } from '../auth.schema'

const FIELD_NAMES = ['password'] as const

// Step two of a password reset: the page the emailed link opens. The backend answers 400 for a link
// that is unknown, expired or already used, and does not sign the user in afterwards.
export function ResetPasswordForm({ token }: { token: string }) {
  const reset = useResetPasswordMutation(token)
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const form = useAppForm({
    defaultValues: { password: '', confirmPassword: '' } as ResetPasswordFormInput,
    validators: { onChange: resetPasswordFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await reset.mutateAsync({ password: value.password })
        setDone(true)
      } catch (error) {
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  if (done) {
    return (
      <div className="flex flex-col gap-5" aria-live="polite">
        <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Password changed</p>
            <p>You can log in with your new password now.</p>
          </div>
        </div>
        <Link href="/login" className={cn(buttonVariants(), 'h-12 w-full rounded-xl text-base')}>
          Go to log in
        </Link>
      </div>
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <form.AppField name="password">
        {(field) => (
          <field.PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="Create a new password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with a letter and a number.`}
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Repeat the new password"
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      {serverError && (
        <Link
          href="/forgot-password"
          className="-mt-2 inline-flex min-h-11 items-center justify-center rounded-lg text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Request a new reset link
        </Link>
      )}

      <form.AppForm>
        <form.SubmitButton>Change password</form.SubmitButton>
      </form.AppForm>

      <Link
        href="/login"
        className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to log in
      </Link>
    </form>
  )
}
