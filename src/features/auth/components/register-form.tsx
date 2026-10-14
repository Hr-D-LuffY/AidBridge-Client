'use client'

import { Mail, Phone, UserRound } from 'lucide-react'
import { useState } from 'react'
import { FormError } from '@/components/forms/form-error'
import { mapServerFieldErrors, setServerFieldError } from '@/components/forms/server-errors'
import { useAppForm } from '@/hooks/use-app-form'
import { getErrorMessage, isApiError } from '@/lib/api/errors'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/lib/constants'
import { useRegisterMutation } from '../auth.queries'
import { type RegisterFormInput, registerFormSchema, toRegisterInput } from '../auth.schema'

const FIELD_NAMES = ['name', 'email', 'phone', 'password'] as const

const CONFLICT_STATUS = 409

// Public sign-up has no role to pick: everyone starts as a person who can ask for help, and can
// apply to volunteer from their dashboard later.
export function RegisterForm({ redirect }: { redirect: string | undefined }) {
  const register = useRegisterMutation(redirect)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    } as RegisterFormInput,
    validators: { onChange: registerFormSchema },
    onSubmit: async ({ value, formApi }) => {
      setServerError(null)
      try {
        await register.mutateAsync(toRegisterInput(value))
      } catch (error) {
        // "Email already registered" belongs under the email field. Field errors from the backend
        // go onto their field. Anything else is shown above the button.
        if (isApiError(error) && error.status === CONFLICT_STATUS) {
          setServerFieldError(formApi, 'email', error.message)
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
      <form.AppField name="name">
        {(field) => (
          <field.TextField
            label="Full name"
            icon={UserRound}
            autoComplete="name"
            placeholder="Your full name"
          />
        )}
      </form.AppField>

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

      <form.AppField name="phone">
        {(field) => (
          <field.TextField
            label="Phone"
            type="tel"
            icon={Phone}
            optional
            autoComplete="tel"
            placeholder="+8801XXXXXXXXX"
            hint="Needed later if you apply to become a volunteer."
          />
        )}
      </form.AppField>

      <form.AppField name="password">
        {(field) => (
          <field.PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            hint={`${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} characters, with a letter and a number.`}
          />
        )}
      </form.AppField>

      <form.AppField name="confirmPassword">
        {(field) => (
          <field.PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
          />
        )}
      </form.AppField>

      <FormError message={serverError} />

      <form.AppForm>
        <form.SubmitButton disabled={register.isSuccess}>Create account</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
