'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage } from '@/lib/api/errors'
import { useLoginMutation } from '../auth.queries'
import { type LoginInput, loginSchema } from '../auth.schema'
import type { DemoRole } from '../demo-roles'
import { DemoLogin } from './demo-login'

type LoginFormProps = {
  redirect: string | undefined
  demoRoles: readonly DemoRole[]
}

const FIELD_NAMES = ['email', 'password'] as const

export function LoginForm({ redirect, demoRoles }: LoginFormProps) {
  const login = useLoginMutation(redirect)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { email: '', password: '' } as LoginInput,
    validators: { onChange: loginSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await login.mutateAsync(value)
      } catch (error) {
        // Field errors from the backend go onto their field. Anything else ("Invalid email or
        // password", rate limit, server asleep) is shown above the button.
        if (!mapServerFieldErrors(formApi, error, FIELD_NAMES)) {
          setServerError(getErrorMessage(error))
        }
      }
    },
  })

  return (
    <div className="flex flex-col gap-6">
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

        <form.AppField name="password">
          {(field) => (
            <field.PasswordField
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
            />
          )}
        </form.AppField>

        <div className="-mt-2 flex justify-end">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-link outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Forgot password?
          </Link>
        </div>

        <FormError message={serverError} />

        <form.AppForm>
          <form.SubmitButton disabled={login.isSuccess}>Log in</form.SubmitButton>
        </form.AppForm>
      </form>

      <DemoLogin availableRoles={demoRoles} redirect={redirect} />
    </div>
  )
}
