'use client'

import { ArrowLeft, Mail, MailCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { useForgotPasswordMutation } from '../auth.queries'
import { type ForgotPasswordInput, forgotPasswordSchema } from '../auth.schema'

const BACK_LINK_CLASS =
  'flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50'

// Step one of a password reset. The backend always answers 200, whether or not the email has an
// account, so the confirmation is worded the same way: "if an account exists".
export function ForgotPasswordForm() {
  const forgot = useForgotPasswordMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '' } as ForgotPasswordInput,
    validators: { onChange: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        const payload = forgotPasswordSchema.parse(value)
        await forgot.mutateAsync(payload)
        setSentTo(payload.email)
      } catch (error) {
        setServerError(getErrorMessage(error))
      }
    },
  })

  if (sentTo) {
    return (
      <div className="flex flex-col gap-5" aria-live="polite">
        <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success-soft p-4 text-sm">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Check your email</p>
            <p>
              If an account exists for <span className="font-medium break-all">{sentTo}</span>, we
              sent a link to reset the password. The link works for 30 minutes and only once.
            </p>
          </div>
        </div>
        <Link href="/login" className={BACK_LINK_CLASS}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to log in
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
      <form.AppField name="email">
        {(field) => (
          <field.TextField
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton>Send reset link</form.SubmitButton>
      </form.AppForm>

      <Link href="/login" className={BACK_LINK_CLASS}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to log in
      </Link>
    </form>
  )
}
